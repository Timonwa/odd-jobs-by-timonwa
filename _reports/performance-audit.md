# Performance audit — The Productivity Bug (tools.timonwa.com)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `code-restructuring` · **Scope:** whole repo — all `src/app` frontend routes and `src/components`, `src/lib` (OG image routes excluded from the route inventory, but their runtime/caching config is in scope) · **Overall:** 6.5/10

> **This is a static-code audit.** No Lighthouse, no WebPageTest, no CrUX/field data was collected — every number below comes from reading the source, the `pnpm build` output, and the emitted artefacts in `.next/`. Where a real measurement is required (notably INP), that is stated rather than guessed.

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | N/A      | 6.5/10  | N/A | N/A   |

First run — `_reports/performance-audit.md` did not exist, so there is no "Resolved since last audit" section and all findings are `NEW`.

## Findings

| ID  | Severity | Category        | Status | Issue                                                                                            | Location                                               |
| --- | -------- | --------------- | ------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| 1   | HIGH     | Images / CLS    | NEW    | `next/image` with `width={0} height={0}` reserves no space — every blog screenshot shifts layout | `src/components/blog/_shared/PostFigure.tsx:19`        |
| 2   | HIGH     | INP             | NEW    | Full article text written to `localStorage` synchronously on every keystroke                     | `src/lib/hooks/use-article-source.ts:150`              |
| 3   | MEDIUM   | Caching         | NEW    | Zero of the 40+ OG/Twitter image routes prerender; 26 opt into `runtime = "edge"`                | `src/app/opengraph-image.tsx:8` (+25 more)             |
| 4   | MEDIUM   | Images          | NEW    | AVIF not enabled; `images` block absent from `next.config.ts` entirely                           | `next.config.ts:4`                                     |
| 5   | MEDIUM   | Rendering       | NEW    | Navbar lives in 15 page components, not a layout — remounts on every navigation                  | `src/components/home/index.tsx:12`                     |
| 6   | MEDIUM   | INP             | NEW    | `DOMPurify.sanitize` runs per keystroke even when the Preview tab is closed                      | `src/components/tools/svg-to-jsx/SvgToJsxTool.tsx:141` |
| 7   | MEDIUM   | Dynamic imports | NEW    | `dompurify` eagerly imported into the `/svg-to-jsx` client bundle; no `next/dynamic` in the repo | `src/components/tools/svg-to-jsx/SvgToJsxTool.tsx:3`   |
| 8   | MEDIUM   | Bundle          | NEW    | No byte budget, analyzer, or Lighthouse CI — and Next 16 no longer prints First Load JS          | `.github/workflows/ci.yml`, `package.json:8`           |
| 9   | MEDIUM   | Caching         | NEW    | Content loaders re-read + re-parse MDX per call with no `cache()`; footer does it on every route | `src/lib/server/utils/create-mdx-loader.utils.ts:44`   |
| 10  | MEDIUM   | Caching         | NEW    | `cacheComponents: true` but no `use cache` / `cacheLife` / `cacheTag` anywhere                   | `next.config.ts:4`                                     |
| 11  | LOW      | Bundle          | NEW    | Redundant `defer` on an `afterInteractive` script; no `preconnect` to the analytics host         | `src/app/layout.tsx:79`                                |
| 12  | LOW      | Images          | NEW    | 1.7 MB of uncompressed source PNGs in `public/blog/` (single files up to 388 KB)                 | `public/blog/gemini/1-open-dashboard.png`              |
| 13  | LOW      | Core Web Vitals | NEW    | No field RUM — Umami's `data-performance` is not Core Web Vitals, so INP is unobservable         | `src/app/layout.tsx:76`                                |
| 14  | LOW      | Bundle          | NEW    | Template-literal `await import()` builds a context module over the whole blog content dir        | `src/components/blog/post/index.tsx:17`                |

### F1 — Blog screenshots reserve zero height, guaranteeing CLS

- **What:** `PostFigure` passes `width={0} height={0}` to `next/image` alongside `className="h-auto w-full"`. Verified in the prerendered output at `.next/server/app/blog/get-a-gemini-api-key.html`, every one of the six screenshots emits literally `<img ... loading="lazy" width="0" height="0" ... class="h-auto w-full rounded-xl border border-border">`. A `0/0` intrinsic ratio is invalid, so the browser cannot compute an aspect-ratio box: each image occupies 0 px of height until its bytes arrive, then expands to its full rendered height (roughly 400–500 px at a 720 px content width), pushing everything below it down. Six lazy-loaded images on one page means six separate shifts, each triggered as the user scrolls toward it — the worst case for CLS, which accumulates over the whole page lifetime, not just load.
- **Why it matters:** This is the single clearest Core Web Vitals defect in the codebase, and it lands on the content pages that carry organic search traffic. Six unreserved images of that size will very plausibly push `/blog/get-a-gemini-api-key` past the CLS < 0.1 threshold on its own. The `sizes` attribute is correct and `alt` is present, so the fix is narrow.
- **Fix:** Give `PostFigure` real intrinsic dimensions. Either (a) accept `width`/`height` props and pass the screenshot's true pixel dimensions, (b) import the screenshots as static imports so Next infers dimensions at build time, or (c) if a fixed shape is acceptable, wrap in a sized `aspect-*` parent and use `fill`. Any of the three reserves the box before the bytes land. The placeholder branch already models this correctly with `aspect-16/10` — the image branch should match it.

### F2 — Every keystroke in a tool's article box does a synchronous `localStorage` write of the whole text

- **What:** `useArticleSource.setText` (`src/lib/hooks/use-article-source.ts:150`) does `if (textEnabledStore.get()) textStore.set(value)`, and `createLocalStore.set` (`src/lib/utils/storage/local-store.utils.ts:56`) calls `opts.write(value)` synchronously, which is `window.localStorage.setItem(key, value)` with the entire current textarea contents. Whenever the "reuse this source" toggle is on, this runs once per `onChange` — i.e. once per keypress — on the article-source textarea of the AI tools and on `WordCounterTool`'s input (`src/components/tools/word-counter/WordCounterTool.tsx:60`). `localStorage.setItem` is a blocking, synchronous, main-thread API that serialises the string and (in Chrome) writes through to a LevelDB-backed store; cost scales with the string length. These tools are explicitly built for pasting whole articles, so the payload is realistically 10–100 KB. No `useDeferredValue`, no debounce, and no `startTransition` guards it — the two `useTransition` calls in the repo are in `use-writer.ts` around the server action, not around input.
- **Why it matters:** This is the INP hazard on the app's most interactive surface. A synchronous write of a large string on every keypress is the textbook cause of input latency and dropped frames while typing. It cannot be measured from code — INP is field-only — but the mechanism is unambiguous, and it also duplicates: the same write path fires again for the `setSourceKind` and reuse-toggle stores.
- **Fix:** Decouple the persist from the render. Keep the keystroke path as React state only, and flush to `localStorage` on a debounce (150–300 ms) or on `blur`/`visibilitychange`. `createLocalStore` is the right place for the change: give it an optional `debounceMs` so `set()` updates the in-memory `cache` and notifies listeners immediately (preserving the `useSyncExternalStore` contract and cross-tool sync) while deferring `opts.write`. That keeps the UI synchronous and takes the disk write off the keypress.

### F3 — No OG image route is prerendered; 26 of them opt out of static generation explicitly

- **What:** `.next/prerender-manifest.json` lists 39 prerendered routes and **zero** of them contain "image" — every `opengraph-image` and `twitter-image` route is `ƒ (Dynamic)` in the build output. For 26 of them the cause is explicit: `export const runtime = "edge"`, and the build prints the warning `⚠ Using edge runtime on a page currently disables static generation for that page`. The comment at `src/app/(tools)/lorem-ipsum/opengraph-image.tsx:7` justifies it as "required by Next.js for OG image routes using `ImageResponse`" — that is no longer true; `ImageResponse` runs on the Node.js runtime in Next 16, and the content OG routes in this same repo (`src/app/blog/[slug]/opengraph-image.tsx`) already omit `runtime` and use `generateStaticParams`.
- **Why it matters:** These images are fully static — fixed copy, no params, no request data. Rendering them means running Satori font-shaping and rasterisation per request, so every social-card unfurl, every crawler pass, and every preview refresh pays server compute and a cold-start latency that Twitter/LinkedIn/Slack scrapers frequently time out on. Prerendering turns 40+ dynamic functions into cached bytes.
- **Fix:** Delete `export const runtime = "edge"` from all 26 routes so they render on Node and prerender at build. For the four `[slug]`/`[category]` families, confirm `generateStaticParams` actually produces prerendered entries afterwards (they do not today) and add a `cacheLife` tier if any must stay on demand.

### F4 — AVIF is off and the `images` config block is absent

- **What:** `next.config.ts` has no `images` key at all. `.next/images-manifest.json` confirms the resulting defaults: `"formats": ["image/webp"]` and `"minimumCacheTTL": 14400` (4 hours). All image sources are local, so `remotePatterns` is legitimately empty and no host is unallowlisted.
- **Why it matters:** The blog screenshots are the only substantial raster payload on the site (1.7 MB of source PNGs, see F12) and they are screenshot-type content — flat UI, large uniform regions — which is exactly where AVIF's advantage over WebP is largest, typically 20–35 % at equal quality. That saving compounds with F1 on the same pages. Separately, a 4-hour optimizer TTL for content-addressed, immutable local assets means needless re-optimisation work.
- **Fix:** Add `images: { formats: ["image/avif", "image/webp"], minimumCacheTTL: 31536000 }`. Keeping WebP second preserves the fallback for non-AVIF clients. Also consider trimming `deviceSizes` — `PostFigure` declares `sizes="(max-width: 768px) 100vw, 720px"`, so the emitted `srcSet` candidates at 1920 w / 2048 w / 3840 w can never be selected and only bloat the markup.

### F5 — The navbar is rendered inside page components instead of a layout

- **What:** `HubNavbar` / `AppNavbar` is imported and rendered by 15 separate page-content components — `src/components/home/index.tsx:12`, `blog/index.tsx`, `blog/post/index.tsx`, `shop/index.tsx`, `shop/product/index.tsx`, `newsletter/index.tsx`, `newsletter/issue/index.tsx`, `categories/index.tsx`, `categories/CategoryDetail.tsx`, `tools/index.tsx`, `_shared/page/AiToolPage.tsx`, `_shared/page/ClientToolPage.tsx`, `errors/error/index.tsx`, `errors/not-found/index.tsx`. `SiteLayout` in the root layout accepts only a `footer` slot (`src/components/ui/layouts/SiteLayout/index.tsx:5`) — there is no navbar slot. Two concrete consequences: (a) because each route's page component is a different component type, React unmounts and remounts the whole `NavActions` client subtree on every client-side navigation — that subtree includes `ToolsMenu` (holding the full `TOOLS` registry with per-tool icons), `ByokDrawer` + `Drawer`, `ThemeToggle`, and `Tooltip`, all of which are eagerly imported and kept mounted-but-hidden by design (`NavActions.tsx:96`); (b) `src/app/loading.tsx` is a bare full-viewport spinner, so while any segment is pending the entire page chrome — navbar included — disappears and then reappears.
- **Why it matters:** Layout components are the mechanism App Router uses to preserve UI and skip re-rendering across navigations. Putting the chrome in the page forfeits that: the navbar's RSC payload ships again with every navigation, its client tree re-hydrates, and its effects (two `document` listeners in `NavActions`, one in `ToolsMenu`, the `IntersectionObserver` chain elsewhere) tear down and re-attach. The vanishing-chrome behaviour during `loading.tsx` is a visible shift on top of that.
- **Fix:** Move the navbar into the root `layout.tsx` (give `SiteLayout` a `navbar` slot beside its existing `footer` slot), and use the `(tools)` route group's own layout for the tool-specific `actionsSlot`/`menuSlot` variants. Then narrow `src/app/loading.tsx` to a content-shaped skeleton that sits below the persistent chrome rather than replacing the viewport.

### F6 — The SVG tool sanitises on every keystroke even when the result is not rendered

- **What:** In `SvgToJsxTool`, `safePreview` is a `useMemo` over `[trimmed]` (line 141) that calls `DOMPurify.sanitize(trimmed, { USE_PROFILES: { svg: true, svgFilters: true } })`. Its only consumer is the `dangerouslySetInnerHTML` at line 310, which is inside a `tab === "preview"` branch (line 299) — and the default tab is `"jsx"` (`TABS` at line 47 lists JSX first). So on the tool's default view, a full DOM-parse-and-sanitise pass runs on every keystroke and its output is thrown away. That is on top of two other per-keystroke passes over the same string on the same tick: `svgToJsx(...)` (the `generated` memo, line 156) and `highlight(code)` from `sugar-high` inside `CodeEditor` (`src/components/ui/blocks/CodeEditor/index.tsx:35`), which re-tokenises the entire document on each render.
- **Why it matters:** Three full passes per keypress, one of them provably wasted. DOMPurify's cost is proportional to node count, and a real illustration SVG (as opposed to the 24×24 icon in `SAMPLE`) can carry thousands of nodes. Same INP caveat as F2: the mechanism is verifiable from code, the magnitude needs field data.
- **Fix:** Gate the memo on the visible tab — `tab === "preview" ? DOMPurify.sanitize(...) : ""` — so it only runs when its output is on screen. For the editor path, feed `CodeEditor` a `useDeferredValue` of the SVG string so highlighting yields to input.

### F7 — `dompurify` is eagerly bundled into the `/svg-to-jsx` client entry, and the repo has no dynamic imports at all

- **What:** `import DOMPurify from "dompurify"` sits at module scope of `SvgToJsxTool.tsx` (line 3), a `"use client"` component that is the tool's primary above-fold surface — so DOMPurify is in the route's initial JS. The shipped ESM build is 118 KB unminified (`node_modules/dompurify/dist/purify.es.mjs`), by a wide margin the heaviest third-party module in any client bundle here; for comparison `sugar-high` is 25 KB and `react-simple-code-editor` is 22 KB. As established in F6, it is needed only when the Preview tab is opened. Grepping the whole repo for `next/dynamic`, `React.lazy`, and `lazy(` returns nothing — there is no code-splitting beyond Next's automatic per-route split. The same eager-import pattern applies to the always-mounted `ByokDrawer` + `Drawer` in the navbar (F5).
- **Why it matters:** This is the clearest single win available on bundle weight, and it is behind an interaction, which is precisely the case `next/dynamic` exists for. Total client chunk output is a reasonable 1.4 MB across 25 chunks (largest 226 KB), so this is optimisation rather than rescue — but it is free.
- **Fix:** Load DOMPurify lazily inside the preview path — `const { default: DOMPurify } = await import("dompurify")` behind the Preview tab, or extract the preview pane into its own component loaded via `next/dynamic(..., { ssr: false, loading: ... })`. `ssr: false` is correct here since the existing code already no-ops during prerender (`typeof window === "undefined"`). Note this is genuinely optional for `sugar-high` and `react-simple-code-editor` — at 25 KB and 22 KB in an always-visible widget, splitting them would cost a round-trip for little gain.

### F8 — Nothing guards bundle size or Core Web Vitals in CI

- **What:** `.github/workflows/ci.yml` runs lint, typecheck, and build. Grepping the repo for `size-limit`, `@next/bundle-analyzer`, `lighthouse`, and `web-vitals` returns no matches in `package.json`, `.github/`, or `src/`. Compounding this: the Next 16 Turbopack build output (captured in this audit) no longer prints the per-route First Load JS table that older versions did, and the per-route `build-manifest.json` files under `.next/server/app/**` list only the identical shared framework chunks — so **there is currently no way, in this project, to see that a change made a route heavier.** That is why this audit reports total chunk output (1.4 MB) rather than per-route First Load JS.
- **Why it matters:** Every other finding here is a point-in-time fix; this is the one that determines whether they stay fixed. Without a budget, bundle growth is invisible until it shows up in field data.
- **Fix:** Add `size-limit` with explicit budgets on the built entry chunks and run it in CI as a required check. Add Lighthouse CI against the money pages — `/`, `/tools`, one client tool, one blog post — asserting CLS and LCP so F1-class regressions fail the PR rather than shipping.

### F9 — Content loaders re-read and re-parse MDX on every call, with no memoisation

- **What:** `createMdxLoader.read` (`src/lib/server/utils/create-mdx-loader.utils.ts:44`) does `fs.readFileSync` + `matter(raw)` + a Zod parse + a word count on every invocation, and `getAll` maps `read` over the whole directory. Nothing is memoised — no `cache()` from React, no module-level `Map`; `React.cache` appears nowhere in `src/lib`. The call sites multiply this: `HubFooter` sits in the **root layout** and calls both `getAllPosts()` and `getAllProducts()` (lines 37–38), so every route render parses both content directories in full. On the home page that is doubled again by `LatestPosts` (`getAllPosts()`) and `ShopPreview` (`getAllProducts()`). Rendering one blog post calls `getPost(slug)` three times — `generateMetadata`, the page body, and the OG route — plus `getAllPosts()` for the related grid.
- **Why it matters:** For the 39 prerendered routes this is build-time cost only, which is why this is MEDIUM and not higher. But it is not confined to build: all 40+ image routes render on demand (F3), and four routes are `◐ (Partial Prerender)` with dynamic fallback shells (`/blog/[slug]`, `/shop/[slug]`, `/newsletter/[slug]`, `/categories/[category]` per `.next/prerender-manifest.json`), so any request on those paths pays synchronous filesystem reads and full frontmatter parsing of every content file — inside a request that is blocking TTFB.
- **Fix:** Wrap `getAll` / `getOne` in `cache()` from React so a single render pass reads each file once, and add a module-level memo keyed by slug so warm server instances skip the filesystem entirely. Content is build-time immutable, so there is no staleness risk.

### F10 — `cacheComponents` is enabled but no cache tier is declared anywhere

- **What:** `next.config.ts:4` sets `cacheComponents: true`. Grepping the repo for `"use cache"`, `cacheLife`, `cacheTag`, `revalidate`, `revalidateTag`, `updateTag`, and `unstable_cache` returns **zero** matches in `src/`. There are also no route-segment `export const dynamic` / `export const revalidate` declarations. The one network fetch in the app (`src/lib/server/actions/newsletter.action.ts:47`) is a POST inside a Server Action, so it correctly needs no cache tier.
- **Why it matters:** Because all content is local and sync, most routes prerender and this is largely benign today — the app is accidentally correct rather than deliberately configured. The gap bites on exactly the surfaces that are not static: the four PPR fallback shells and every image route re-execute their work per request with no declared tier, so there is nothing to tune and nothing to invalidate. It also means the project gets no benefit from having opted into the Cache Components model.
- **Fix:** Put the content loaders behind `"use cache"` with a named `cacheLife` tier (`static` fits build-time-immutable MDX) and a `cacheTag` constant, so the dynamic fallbacks and image routes serve from cache instead of re-deriving. Keep tags in a constants module rather than inline string literals, matching the repo's existing `namespaced()` discipline for storage keys and events.

### F11 — Redundant `defer` on the analytics script, and no `preconnect` to its host

- **What:** `src/app/layout.tsx:79` renders `<Script defer src="https://cloud.umami.is/script.js" ... strategy="afterInteractive" />`. `afterInteractive` already means "inject after hydration", so the `defer` attribute is meaningless alongside it and signals confused intent. There is no `<link rel="preconnect">` for `cloud.umami.is` anywhere (grepping for `preconnect`, `dns-prefetch`, and `rel="preload"` returns nothing).
- **Why it matters:** Minor. The gating on `isProduction` and the choice of `afterInteractive` are both correct, and analytics is the right kind of script for it — no render-blocking `<script>` exists in the head other than the tiny theme snippet, which is standard and correct. This is hygiene, not a defect.
- **Fix:** Drop `defer`. If analytics timing matters, either add `preconnect` for `cloud.umami.is` or move it to `lazyOnload`, which is usually the better trade for a page-view beacon. `next/font` self-hosts, so no font preconnect is needed or wanted.

### F12 — Uncompressed source screenshots in `public/`

- **What:** `public/blog/` is 1.7 MB across six PNGs, individually 217–388 KB (`public/blog/gemini/1-open-dashboard.png` is the largest at 388 KB). They do route through `next/image` and nothing uses `unoptimized`, so users receive optimised derivatives, not these bytes. Icons and logos are already reasonable (`public/logo.png` at 4 KB), and `public/android-chrome-512x512.png` at 202 KB is a one-off manifest asset.
- **Why it matters:** Not user-facing, since the optimizer stands in front of them — hence LOW. It is repo weight, deploy-artefact weight, and per-variant optimizer CPU on cold cache. Screenshot PNGs of this size are typically 24-bit where 8-bit palette output would be visually identical.
- **Fix:** Run the screenshots through `oxipng`/`pngquant` (or export as 8-bit) before committing. Pairs naturally with F4.

### F13 — No field measurement of Core Web Vitals

- **What:** The only analytics is Umami with `data-performance="true"` (`src/app/layout.tsx:76`). That flag reports Umami's own page-load timings, not Core Web Vitals; there is no `web-vitals` dependency and no `useReportWebVitals` call in the repo.
- **Why it matters:** INP is measurable only from real interactions — it cannot be derived from code and cannot be produced by a lab run either. Findings F2 and F6 identify the mechanisms but their actual severity is unknowable without field data, and there is currently no instrument that would show whether fixing them helped. The same applies to verifying F1's CLS impact in the wild.
- **Fix:** Add the `web-vitals` library behind `useReportWebVitals` and beacon LCP/CLS/INP to Umami as custom events. Cross-check against CrUX once the site has enough traffic to appear there. Then re-verify F1, F2, and F6 against real numbers rather than reasoning.

### F14 — Template-literal dynamic import over the content directory

- **What:** `src/components/blog/post/index.tsx:17` does `await import(\`@/content/blog/${post.slug}.mdx\`)`. A non-literal import specifier forces the bundler to build a context module covering every `.mdx`file matching the pattern, so rendering one post pulls the compiled output of all of them into the server chunk. Separately,`src/mdx-components.tsx:110`provides a raw`<img>`fallback (with an`@next/next/no-img-element`eslint-disable) carrying no`width`/`height`— the same CLS shape as F1, currently dormant because grepping`src/content` for markdown image syntax finds none.
- **Why it matters:** Both are server-side or latent, hence LOW. This is a Server Component, so nothing here reaches the client bundle — it is cold-start and server-memory cost that grows linearly with post count. The `<img>` fallback is a trap for whoever writes the first post using plain markdown image syntax.
- **Fix:** Leave the dynamic import unless the post count grows substantially, at which point an explicit slug→import map makes the graph static. For the fallback, either give it dimensions or remove it so authors are pushed to `PostFigure`, which is already the documented path.

## What is already right

Worth recording so it does not regress:

- **Server/client boundary.** This is the strongest area. Every one of the 63 `"use client"` files was checked and each genuinely needs the browser — hooks, DOM listeners, or `window`. Pages are thin server entries (`src/app/page.tsx` is three lines) that delegate to feature components, interactivity is pushed to leaves, and server-only code is correctly fenced with `import "server-only"` (`create-mdx-loader.utils.ts:5`). No server library, admin SDK, or Node built-in leaks into a client bundle.
- **Fonts.** `next/font/google` for both Geist and Geist Mono in the root layout, `subsets: ["latin"]`, exposed as CSS variables. Self-hosted with no extra round-trip; `display: "swap"` and `adjustFontFallback` come from the defaults. No legacy `<link>` tags and no `@import url(fonts.googleapis…)` in `src/styles/`. Geist Mono's site-wide preload is justified — `font-mono` is used in the navbar's BYOK panel, not just code blocks.
- **The one Suspense boundary that matters is correct.** `useSearchParams` in `FilterableTools` is wrapped at `src/components/tools/index.tsx:35` with a fallback that renders the full unfiltered grid, so the tools are in the initial HTML and `/tools` still builds as `○ (Static)`.
- **Bundle hygiene.** No barrel or whole-library imports defeating tree-shaking, no `require()` in client code, the single `import * as` is inside a generated code string rather than a real import, and every `console.*` call is in an error boundary or a server-side logger — none in a shipped client path.
- **Rendering.** React Compiler is on, so manual memo sprawl is correctly absent. Mapped `key={i}` usages were each checked against their mutation patterns: `SeoMetaResults` variations are only ever updated in place by index (never removed or reordered, per `SeoMetaTool.tsx:112` and `:139`), so index keys are safe there — not a finding. `YouTubeEmbed` correctly carries `aspect-video` plus `loading="lazy"`.
- **LCP posture.** Every above-fold hero is text with a CSS gradient wash — there is no hero image anywhere, so the absence of `priority` is correct rather than an oversight, and no image competes with the LCP text element. Public pages are statically renderable, keeping TTFB low.

## Scorecard

| Category               | Score | Notes                                                                                                                    |
| ---------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------ |
| Images                 | 5/10  | `next/image` used correctly with `alt` + `sizes`, but `width={0} height={0}` forfeits CLS protection (F1); AVIF off (F4) |
| Bundle                 | 7/10  | 1.4 MB total chunks, clean imports, no server code client-side — but nothing guards growth and Next 16 hides it (F8)     |
| Server/client boundary | 9/10  | Every `"use client"` justified; thin server pages; interactivity at the leaves; `server-only` fencing                    |
| Dynamic imports        | 4/10  | Zero `next/dynamic` in the repo; 118 KB DOMPurify eager in a client tool, drawers always mounted (F7)                    |
| Fonts                  | 9/10  | `next/font` self-hosted, subset, CSS variables, swap default; only a missing analytics `preconnect` (F11)                |
| Streaming              | 6/10  | The `useSearchParams` boundary is right, but the sole `loading.tsx` is a chrome-wiping spinner (F5)                      |
| Caching                | 5/10  | `cacheComponents` on with no tier declared (F10); no OG prerender (F3); unmemoised per-request MDX parsing (F9)          |
| Rendering              | 7/10  | React Compiler, stable keys, server-first — but chrome remounts per navigation (F5) and per-keystroke sync work (F6)     |
| Core Web Vitals        | 6/10  | Strong LCP posture (text heroes, static routes); CLS regressed by F1; **INP not scored — field-only, see F13**           |

**On INP:** deliberately excluded from the Core Web Vitals score. It requires real interaction data and cannot be derived from source or from a lab run. F2 and F6 identify concrete mechanisms that would degrade it, but their magnitude needs the RUM described in F13 before anyone claims a number.

## Action items

Phase is `production`, so tiers are Fix Now / Next Release / Backlog.

### Fix Now

| #   | Priority | Task (finding ID)                                                                                              | Effort |
| --- | -------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Give `PostFigure` real intrinsic dimensions (static import or explicit `width`/`height`) to stop blog CLS (F1) | S      |
| 2   | P0       | Debounce the `localStorage` write in `createLocalStore` so keystrokes stop blocking the main thread (F2)       | S      |

### Next Release

| #   | Priority | Task (finding ID)                                                                                    | Effort |
| --- | -------- | ---------------------------------------------------------------------------------------------------- | ------ |
| 3   | P1       | Remove `runtime = "edge"` from all 26 OG/Twitter routes and verify they prerender (F3)               | S      |
| 4   | P1       | Add the `images` config block — AVIF first, long `minimumCacheTTL` (F4)                              | S      |
| 5   | P1       | Gate `safePreview` on the active tab; defer the editor's highlight input (F6)                        | S      |
| 6   | P1       | Lazy-load `dompurify` behind the Preview tab via `next/dynamic` / `await import()` (F7)              | S      |
| 7   | P1       | Wrap the MDX loaders in `cache()` + a module memo; stop the root-layout footer re-parsing (F9)       | S      |
| 8   | P2       | Move the navbar into the root layout; replace the spinner `loading.tsx` with a content skeleton (F5) | M      |
| 9   | P2       | Wire `size-limit` budgets and Lighthouse CI as required checks (F8)                                  | M      |

### Backlog

| #   | Priority | Task (finding ID)                                                                          | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------ | ------ |
| 10  | P2       | Declare `use cache` + `cacheLife` + `cacheTag` on the content layer (F10)                  | M      |
| 11  | P2       | Add `web-vitals` reporting so LCP/CLS/INP become observable, then re-verify F1/F2/F6 (F13) | S      |
| 12  | P3       | Pre-compress the `public/blog/` screenshots (F12)                                          | S      |
| 13  | P3       | Drop the redundant `defer`; add analytics `preconnect` or switch to `lazyOnload` (F11)     | S      |
| 14  | P3       | Give the `mdx-components.tsx` `<img>` fallback dimensions, or remove it (F14)              | S      |

## Resolved since last audit

First run — no prior report to compare against.
