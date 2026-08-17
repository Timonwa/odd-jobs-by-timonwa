# Frontend audit — The Productivity Bug (Next.js 16 App Router)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `feat/the-productivity-bug` · **Scope:** whole repo (`src/app`, `src/components`, `src/lib`), verified against a real `next build` · **Overall:** 7/10

## Score change (previous → current)

| Metric  | Previous        | Current | Δ   | Trend |
| ------- | --------------- | ------- | --- | ----- |
| Overall | N/A (first run) | 7/10    | N/A | N/A   |

## Findings

| ID  | Severity | Category               | Status | Issue                                                                                                                                                                              | Location                                                         |
| --- | -------- | ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | HIGH     | Router hygiene         | NEW    | `export const runtime = "edge"` on 26 OG/Twitter image routes disables static generation (Next warns during build)                                                                 | `src/app/blog/opengraph-image.tsx:7` (+25 more)                  |
| 2   | MEDIUM   | Caching                | NEW    | No cache tier, tag, or `cache()` dedupe anywhere in the repo despite `cacheComponents: true`; the MDX loader re-reads and re-parses whole content dirs several times per render    | `src/lib/server/utils/create-mdx-loader.utils.ts:44`             |
| 3   | MEDIUM   | Caching                | NEW    | Per-slug OG/Twitter image routes have `generateStaticParams` but still build as `ƒ Dynamic` — no `"use cache"`, so every social scrape re-reads MDX and re-renders Satori          | `src/app/blog/[slug]/opengraph-image.tsx:13`                     |
| 4   | MEDIUM   | Mutations              | NEW    | AI Server Actions never validate their input with Zod — TS param types are erased at the action boundary, and bad `style.postLength` / `platforms` values reach char-limit lookups | `src/lib/server/actions/social-posts.action.ts:146`              |
| 5   | MEDIUM   | Mutations              | NEW    | `subscribeNewsletter` has no rate limit (unlike the AI actions), so the action is an unauthenticated relay into the Sender.net list                                                | `src/lib/server/actions/newsletter.action.ts:23`                 |
| 6   | MEDIUM   | Data fetching          | NEW    | `HostedUsagePill` fetches server-derivable config through a Server Action in an effect on every AI tool page                                                                       | `src/components/_shared/result/HostedUsagePill.tsx:21`           |
| 7   | MEDIUM   | Server/client boundary | NEW    | Whole `Newsletter` marketing section is `"use client"`; only the form needs the boundary, and it renders on nearly every page                                                      | `src/components/_shared/content/Newsletter.tsx:1`                |
| 8   | MEDIUM   | Page structure         | NEW    | Four files well past the ~200-line ceiling (501 / 454 / 391 / 373)                                                                                                                 | `src/components/_shared/writer/TemplatesPicker.tsx`              |
| 9   | MEDIUM   | Components             | NEW    | JSON-LD hand-rolled as a raw `dangerouslySetInnerHTML` `<script>` in 9 tool layouts while a shared `JsonLdScript` exists                                                           | `src/app/(tools)/word-counter/layout.tsx:89`                     |
| 10  | LOW      | Server/client boundary | NEW    | `Tooltip` is marked `"use client"` but is pure CSS — no hook, handler, or browser API                                                                                              | `src/components/ui/base/Tooltip/index.tsx:1`                     |
| 11  | LOW      | React                  | NEW    | Manual `useMemo` / `useCallback` throughout while the React Compiler is enabled                                                                                                    | `src/lib/hooks/writer/use-writer.ts:121`                         |
| 12  | LOW      | Page structure         | NEW    | `HubNavbar` is composed into 12 page contents instead of a hub route-group layout                                                                                                  | `src/components/blog/index.tsx:27`                               |
| 13  | LOW      | React                  | NEW    | Index-as-key on editable lists (SEO variations, thread items)                                                                                                                      | `src/components/tools/article-to-seo-meta/SeoMetaResults.tsx:58` |
| 14  | LOW      | Server/client boundary | NEW    | `@/components/ui` is one flat barrel mixing client-boundary components with server-renderable ones                                                                                 | `src/components/ui/index.ts:4`                                   |

### F1 — `runtime = "edge"` on 26 metadata image routes kills their static generation

- **What:** 26 route files export `export const runtime = "edge"` (every `(tools)/*/opengraph-image.tsx` and `twitter-image.tsx`, plus the root, `/blog`, `/newsletter`, `/shop` cards). `next build` prints `⚠ Using edge runtime on a page currently disables static generation for that page`, and the route table confirms it — e.g. `ƒ /word-counter/opengraph-image-1xk1tt`, `ƒ /blog/opengraph-image` — while every ordinary page in the same build is `○ (Static)`. These images take no params and no request input: `src/app/blog/opengraph-image.tsx:12` renders a hardcoded card.
- **Why it matters:** A card that could be one build-time PNG is instead a Satori render on every crawler, Slack unfurl, and social scrape — per-request CPU and cold-start latency on the hot path for link previews, plus the edge runtime needlessly bars Node APIs from `og-image.utils.tsx`. `runtime = "edge"` is early-App-Router advice that Next 16 now actively warns about.
- **Fix:** Delete the `export const runtime = "edge"` line from all 26 files (`next/og` works in the default Node runtime) and let them prerender.

### F2 — No cache tier, tag, or dedupe on the content data layer

- **What:** `grep` for `"use cache"`, `cacheTag`, `cacheLife`, `revalidateTag`, `revalidatePath`, `unstable_cache`, or React `cache()` returns nothing across `src/`. Every content read goes straight to the filesystem: `createMdxLoader.read()` does `fs.readFileSync` + `gray-matter` + `countWords` per file (`create-mdx-loader.utils.ts:44-56`), and `getAll()` maps that over the whole directory (`:67`). Because `HubFooter` sits in the root layout and calls both `getAllPosts()` and `getAllProducts()` (`HubFooter.tsx:37-38`), _every_ route in the app re-reads and re-parses the entire blog and shop content dirs; `/blog` then reads all posts again (`components/blog/index.tsx:12`), and `/blog/[slug]` does `getPost` in `generateMetadata`, `getPost` again in the page, and `getAllPosts()` in `PostPageContent` (`components/blog/post/index.tsx:19`) — four passes over the same files for one page.
- **Why it matters:** Today the blast radius is bounded (the pages prerender, so the cost lands at build and in `next dev`), but it means the project runs `cacheComponents: true` with zero cache tiers and zero tags — nothing is invalidatable, and the moment one of these segments becomes dynamic (or ISR/on-demand revalidation is wanted) the uncached disk work moves onto the request path with no way to tag or revalidate it.
- **Fix:** Wrap the loader entry points (`getAllPosts` / `getAllIssues` / `getAllProducts` / `getOne`) in `"use cache"` with an explicit `cacheLife` and a `cacheTag` per content type (e.g. `content:blog`), and at minimum wrap the per-request reads in React `cache()` so one render doesn't re-parse the same file repeatedly.

### F3 — Per-slug OG image routes are dynamic on demand

- **What:** `src/app/blog/[slug]/opengraph-image.tsx`, `newsletter/[slug]/opengraph-image.tsx`, and `shop/[slug]/opengraph-image.tsx` each export `generateStaticParams()` and read MDX via `getPost`/`getIssue`/`getProduct`, yet the build emits them as dynamic with a fallback placeholder: `ƒ /blog/-/opengraph-image`, `ƒ /newsletter/-/opengraph-image`, `ƒ /shop/-/opengraph-image` (contrast the pages themselves, which are `◐` with all known slugs listed). These files do _not_ set the edge runtime, so this is the Cache Components default for image routes, not F1.
- **Why it matters:** Each post/issue/product card is generated per request — a filesystem read plus frontmatter parse plus a Satori render — instead of once at build, exactly on the path crawlers and social unfurlers hit.
- **Fix:** Add `"use cache"` (with a `cacheLife` and the content tag from F2) to these image handlers so the known slugs prerender and the fallback is cached rather than recomputed.

### F4 — Server Actions accept unvalidated input

- **What:** `generateSeoMeta` / `regenerateSeoMetaVariation` (`seo-meta.action.ts:95,134`) and `generateSocialPosts` / `regenerateSocialPost` (`social-posts.action.ts:146,199`) declare TypeScript param shapes but validate nothing at runtime; a Server Action is a public POST endpoint, so those types are gone. Verified partial mitigations: `resolveArticleSource` hand-validates the URL/text and blocks SSRF hosts, `variationCount` is clamped to 1-3, and `byokModel` is allowlisted in `gemini.client.ts:25`. What is _not_ checked: `style` (JSON-stringified straight into the prompt, `social-posts.action.ts:141`), `platforms`, `xThreadLength`, and `style.postLength` — a crafted `postLength` makes `LONGFORM_SOCIAL_POST_LENGTH_LIMITS[postLength]` return `undefined`, so `resolveSocialPostCharLimit` (`:84`) hands `undefined` into `SocialPost.charLimit`, which the UI renders as `N / undefined` (`PostCard.tsx:100`) and compares against.
- **Why it matters:** The type-erased boundary is the one place the house standard requires a schema; without it the action returns values that violate its own `SocialPost` type, and an arbitrary `xThreadLength` / `style` blob steers the model on the hosted key.
- **Why it isn't higher:** the genuinely dangerous inputs (source URL, BYOK model) _are_ checked, and the quota gate runs before the LLM call, so the impact is malformed output rather than a breach.
- **Fix:** Define one Zod schema per action, `safeParse` the params first, and return the existing `{ ok: false, error }` shape on failure.

### F5 — The newsletter Server Action has no rate limit

- **What:** `subscribeNewsletter` (`newsletter.action.ts:23`) validates the email with Zod and then POSTs it to Sender.net with the server's `SENDER_API_TOKEN`. It never calls `enforceDailyQuota` / `checkAndIncrementQuota`, unlike both AI actions. There is no captcha, no origin check beyond the framework's, and no per-IP counter — the Redis helper that already exists (`rate-limit.utils.ts:78`) is simply not wired in here.
- **Why it matters:** Anyone can script the action to inject unlimited third-party addresses into the live subscriber list (list poisoning / mail-bombing others via the automation) and burn the Sender.net quota. It is the only unthrottled mutation in the app.
- **Fix:** Reuse `checkAndIncrementQuota` with a `newsletter` slug and a low per-IP daily cap before the outbound `fetch`. (Overlaps `security-audit` — OWASP API4 unrestricted resource consumption.)

### F6 — Hosted-usage config is fetched from the client instead of resolved on the server

- **What:** `HostedUsagePill` runs `getUsage()` — the `fetchSeoMetaUsage` / `fetchSocialPostsUsage` Server Actions — inside a `useEffect` on mount (`HostedUsagePill.tsx:21-33`) and returns `null` until it resolves (`:37`). Those actions only call `getRateLimitStatus()`, which is a synchronous read of `isProduction` plus two env vars (`rate-limit.utils.ts:111`). The pill's parent, `SeoMetaHostedUsageNotice`, is already a Server Component (`SeoMetaHostedUsageNotice.tsx:1-11`) and could compute the value directly.
- **Why it matters:** Every AI tool page load spends a Server Action round-trip on a constant, and the navbar pill pops in afterwards (layout shift in the header). The in-file comment justifies the effect as "avoid a waterfall", but there is no waterfall to avoid — the value is static config, not per-request data.
- **Fix:** Resolve `configured` in the server notice component and pass it as a prop; keep the effect only for the live `subscribeHostedUsage` remaining-count updates (`:35`), which genuinely is client state.

### F7 — The whole newsletter section sits behind `"use client"`

- **What:** `Newsletter.tsx:1` puts the directive at the top of a component that is ~90% static markup — heading, two decorative blur divs, body copy, icon — with only the `<form>` needing `useActionState` / `useFormStatus` (`:27`, `:17`). The section is rendered on the home page, `/blog`, `/newsletter`, `/shop`, every post, every issue, every product, `/tools`, and `/categories`.
- **Why it matters:** The boundary is pushed above the leaf that needs it, so static marketing markup and its icon import ship as client JS on nearly every route in the app.
- **Fix:** Keep `Newsletter` a Server Component and extract the form (plus `SubmitButton`) into a small `NewsletterForm` client leaf.

### F8 — Oversized component/hook files

- **What:** `_shared/writer/TemplatesPicker.tsx` is 501 lines, `tools/svg-to-jsx/SvgToJsxTool.tsx` 454, `lib/hooks/writer/use-writer.ts` 391, `tools/article-to-seo-meta/SeoMetaTool.tsx` 373 — against a ~200-line guideline that the rest of the repo holds to well.
- **Why it matters:** `TemplatesPicker` and `SvgToJsxTool` each carry several independent concerns (list + rename + delete + apply; parse + settings menu + preview + output) in one client file, which is where merge pain and accidental re-render coupling accumulate.
- **Fix:** Split by concern — e.g. `TemplatesPickerList` / `TemplateRow` / `TemplateNameForm`; lift `SvgToJsxTool`'s settings menu and preview into siblings; move `use-writer`'s regeneration branch into its own hook.

### F9 — JSON-LD duplicated instead of using the shared component

- **What:** Nine tool layouts each inline the same pattern — `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />` (`(tools)/word-counter/layout.tsx:89-94`, `(tools)/article-to-seo-meta/layout.tsx:90-96`, and seven siblings) — while `components/_shared/content/JsonLdScript.tsx` implements exactly that, escaping included, and is used by the blog/newsletter/shop pages.
- **Why it matters:** Nine hand-copied `dangerouslySetInnerHTML` call sites are nine chances for the `<`-escaping to be dropped on the next copy-paste, and the shared primitive exists precisely to own that rule.
- **Fix:** Replace each inline script with `<JsonLdScript data={jsonLd} />`.

### F10 — `Tooltip` is a client component with nothing client about it

- **What:** `ui/base/Tooltip/index.tsx:1` declares `"use client"`, but the body is a `<span>` with `group-hover` / `group-focus-within` Tailwind classes and a `cn()` call — no hook, no event handler, no browser API (verified by scanning the file for `use*`, `on*=`, `window`/`document`/`navigator`/`localStorage`/`addEventListener`).
- **Why it matters:** It re-exports through `@/components/ui`, so a Server Component using it opens a client boundary (and its `children` become serialized props) for a CSS-only effect.
- **Fix:** Drop the directive.

### F11 — Hand-rolled memoization under the React Compiler

- **What:** `reactCompiler: true` is set in `next.config.ts:5`, yet `useCallback`/`useMemo` are applied defensively across the client layer: 11 `useCallback`s in `use-writer.ts` (`:121-311`), 6 in `SeoMetaTool.tsx` (`:109-173`), plus `useMemo`s in `CaseConverterTool.tsx:23`, `WordCounterTool.tsx:31`, `ReadingTimeTool.tsx:38`, `SlugGeneratorTool.tsx:31`, `ToolsMenu.tsx:31`, `SvgToJsxTool.tsx:141,151`, and the store factories.
- **Why it matters:** The compiler already memoizes these; the manual wrappers add dependency arrays that must be kept correct by hand (a stale-closure surface the compiler removes) and obscure the actual logic.
- **Fix:** Remove them where the compiler covers the case, keeping only memoization that exists for a semantic reason (referential identity required by an external store or a genuinely expensive computation worth pinning).

### F12 — The hub navbar is composed per page rather than in a layout

- **What:** `<HubNavbar />` appears in 12 page-content components (`home/index.tsx:15`, `blog/index.tsx:27`, `blog/post/index.tsx:46`, `newsletter/index.tsx:27`, `newsletter/issue/index.tsx:51`, `shop/index.tsx:27`, `shop/product/index.tsx:46`, `categories/index.tsx:12`, `categories/CategoryDetail.tsx:24`, `tools/index.tsx:16`, and both error contents). The root layout only supplies `SiteLayout` + `HubFooter` (`app/layout.tsx:75`); there is no hub route group with its own shell, even though `(tools)` shows the group pattern is understood.
- **Why it matters:** Twelve call sites for one invariant chrome element — a new hub page can silently ship without a navbar, and the navbar subtree re-renders per navigation instead of being hoisted into a persistent layout.
- **Fix:** Add a `(hub)` route group whose `layout.tsx` renders `HubNavbar` (plus `PageMain`, which is equally repeated), and drop it from the page contents.

### F13 — Index-as-key on editable lists

- **What:** `SeoMetaResults.tsx:58` keys variation cards by array index, and `PostCard.tsx:83` keys thread-item textareas by index.
- **Why it matters:** Both lists hold controlled inputs. Today nothing reorders or splices them — regeneration replaces an item in place (`SeoMetaTool.tsx:138`) — so this is latent rather than broken; the moment a "remove variation" or "reorder thread" affordance is added, DOM state (caret position, scroll, focus) attaches to the wrong row.
- **Fix:** Key by a stable id carried on the item rather than its position.

### F14 — One flat `ui` barrel spanning client and server-renderable components

- **What:** `components/ui/index.ts` re-exports all four tiers with `export *`, so `Tooltip`, `Drawer`, `CopyButton`, `CodeEditor`, and `Breadcrumbs` (all `"use client"`) sit in the same entry point as the server-renderable `Card`, `Section`, `PageMain`, `PageHero`, and `Footer`, which server components import heavily (e.g. `blog/index.tsx:3`).
- **Why it matters:** Nothing is currently broken — the barrel comment is accurate that it is client-_safe_, and no server-only module leaks through it (verified: no `"use client"` file imports `@/lib/server`) — but mixing boundary and non-boundary modules in one `export *` makes it easy for a future addition to pull a client subtree, or a server-only helper, in behind an innocuous import.
- **Fix:** Keep importing per tier (`@/components/ui/base`, `.../blocks`) where a server component only needs static primitives, or split the barrel so client-boundary components are re-exported from their own entry.

## Scorecard

| Category               | Score | Notes                                                                                                                                                                                                                                         |
| ---------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Router hygiene         | 7/10  | Zero Pages Router residue, `params` awaited everywhere, Metadata API only, sensible 308 redirects — but 26 image routes opt into the edge runtime and lose static generation (F1).                                                            |
| Page structure         | 8/10  | Route entries are genuinely thin (metadata + static params + one `…PageContent`), sections are one-per-file and feature-grouped; four files exceed the size ceiling and the navbar isn't hoisted to a layout (F8, F12).                       |
| Server/client boundary | 8/10  | No server-only module reaches a client file, `next/headers` stays in the action layer, `"use client"` mostly sits on real leaves; one whole static section and one CSS-only primitive are over-marked (F7, F10, F14).                         |
| Data fetching          | 7/10  | All initial data is read on the server with no client fetch to internal APIs and no waterfalls; one Server Action round-trip in an effect for static config (F6).                                                                             |
| Mutations              | 6/10  | Writes are Server Actions in `lib/server/actions` driven by `<form action>` / `useActionState` with typed result unions — but no Zod at the boundary and one unthrottled action (F4, F5).                                                     |
| Caching                | 4/10  | `cacheComponents: true` with no `"use cache"`, no `cacheTag`, no `cacheLife`, no `revalidateTag`, and no `cache()` dedupe anywhere; content dirs are re-parsed several times per render and OG routes render per request (F2, F3).            |
| Components             | 8/10  | Clean `base/blocks/patterns/layouts` tiers, folder-per-component, feature folders with `_shared`, prop-driven primitives; JSON-LD is re-implemented in nine layouts (F9).                                                                     |
| React                  | 8/10  | Strong React 19 idioms — `useActionState`, `useFormStatus`, `useEffectEvent`, `useSyncExternalStore` for hydration-safe browser checks, no `forwardRef`, no effect-driven state syncing; manual memoization and index keys remain (F11, F13). |

## Action items

### Fix Now

| #   | Priority | Task (finding ID)                                                                                 | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Delete `export const runtime = "edge"` from all 26 OG/Twitter image routes so they prerender (F1) | S      |
| 2   | P0       | Rate-limit `subscribeNewsletter` with the existing `checkAndIncrementQuota` helper (F5)           | S      |

### Next Release

| #   | Priority | Task (finding ID)                                                                                                       | Effort |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| 3   | P1       | Add `"use cache"` + `cacheLife` + `cacheTag` to the MDX loader entry points, and `cache()`-dedupe per-render reads (F2) | M      |
| 4   | P1       | Cache the per-slug OG/Twitter image handlers so known slugs prerender (F3)                                              | S      |
| 5   | P1       | Zod-validate every Server Action's params before use, returning the existing error shape (F4)                           | M      |
| 6   | P2       | Resolve hosted-usage `configured` on the server and pass it as a prop (F6)                                              | S      |
| 7   | P2       | Extract `NewsletterForm` so the section stays a Server Component (F7)                                                   | S      |
| 8   | P2       | Replace the nine inline JSON-LD scripts with `JsonLdScript` (F9)                                                        | S      |
| 9   | P2       | Drop `"use client"` from `Tooltip` (F10)                                                                                | S      |

### Backlog

| #   | Priority | Task (finding ID)                                                            | Effort |
| --- | -------- | ---------------------------------------------------------------------------- | ------ |
| 10  | P3       | Split the four oversized files by concern (F8)                               | M      |
| 11  | P3       | Introduce a `(hub)` route group layout owning `HubNavbar` + `PageMain` (F12) | M      |
| 12  | P3       | Strip compiler-covered `useMemo`/`useCallback` (F11)                         | M      |
| 13  | P3       | Key editable lists by stable ids (F13)                                       | S      |
| 14  | P3       | Split the `ui` barrel along the client boundary (F14)                        | S      |

## Resolved since last audit

First run — nothing to compare.
