# Frontend audit — The Productivity Bug (Next.js 16 App Router)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** fixes applied · **Branch:** `feat/the-productivity-bug` · **Scope:** whole repo (`src/app`, `src/components`, `src/lib`), verified against a real `next build` · **Overall:** 9/10

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | 7/10     | 9/10    | +2  | ▲     |

## Findings

| ID  | Severity | Category               | Status         | Issue                                                                                                                                                                              | Location                                                         |
| --- | -------- | ---------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | HIGH     | Router hygiene         | **REJECTED**   | `export const runtime = "edge"` on 26 OG/Twitter image routes disables static generation (Next warns during build)                                                                 | `src/app/blog/opengraph-image.tsx:7` (+25 more)                  |
| 2   | MEDIUM   | Caching                | **FIXED**      | No cache tier, tag, or `cache()` dedupe anywhere in the repo despite `cacheComponents: true`; the MDX loader re-reads and re-parses whole content dirs several times per render    | `src/lib/server/utils/create-mdx-loader.utils.ts:44`             |
| 3   | MEDIUM   | Caching                | **NOT VIABLE** | Per-slug OG/Twitter image routes have `generateStaticParams` but still build as `ƒ Dynamic` — no `"use cache"`, so every social scrape re-reads MDX and re-renders Satori          | `src/app/blog/[slug]/opengraph-image.tsx:13`                     |
| 4   | MEDIUM   | Mutations              | **FIXED**      | AI Server Actions never validate their input with Zod — TS param types are erased at the action boundary, and bad `style.postLength` / `platforms` values reach char-limit lookups | `src/lib/server/actions/social-posts.action.ts:146`              |
| 5   | MEDIUM   | Mutations              | **FIXED**      | `subscribeNewsletter` has no rate limit (unlike the AI actions), so the action is an unauthenticated relay into the Sender.net list                                                | `src/lib/server/actions/newsletter.action.ts:23`                 |
| 6   | MEDIUM   | Data fetching          | **FIXED**      | `HostedUsagePill` fetches server-derivable config through a Server Action in an effect on every AI tool page                                                                       | `src/components/_shared/result/HostedUsagePill.tsx:21`           |
| 7   | MEDIUM   | Server/client boundary | **FIXED**      | Whole `Newsletter` marketing section is `"use client"`; only the form needs the boundary, and it renders on nearly every page                                                      | `src/components/_shared/content/Newsletter.tsx:1`                |
| 8   | MEDIUM   | Page structure         | **FIXED**      | Four files well past the ~200-line ceiling (501 / 454 / 391 / 373)                                                                                                                 | `src/components/_shared/writer/TemplatesPicker.tsx`              |
| 9   | MEDIUM   | Components             | **FIXED**      | JSON-LD hand-rolled as a raw `dangerouslySetInnerHTML` `<script>` in 9 tool layouts while a shared `JsonLdScript` exists                                                           | `src/app/(tools)/word-counter/layout.tsx:89`                     |
| 10  | LOW      | Server/client boundary | **FIXED**      | `Tooltip` is marked `"use client"` but is pure CSS — no hook, handler, or browser API                                                                                              | `src/components/ui/base/Tooltip/index.tsx:1`                     |
| 11  | LOW      | React                  | **ACCEPTED**   | Manual `useMemo` / `useCallback` throughout while the React Compiler is enabled                                                                                                    | `src/lib/hooks/writer/use-writer.ts:121`                         |
| 12  | LOW      | Page structure         | **FIXED**      | `HubNavbar` is composed into 12 page contents instead of a hub route-group layout                                                                                                  | `src/components/blog/index.tsx:27`                               |
| 13  | LOW      | React                  | **REJECTED**   | Index-as-key on editable lists (SEO variations, thread items)                                                                                                                      | `src/components/tools/article-to-seo-meta/SeoMetaResults.tsx:58` |
| 14  | LOW      | Server/client boundary | **ACCEPTED**   | `@/components/ui` is one flat barrel mixing client-boundary components with server-renderable ones                                                                                 | `src/components/ui/index.ts:4`                                   |

## What was applied

### F8 — FIXED: `TemplatesPicker` split, 501 → 245 lines

Five components in one file became four files: the picker keeps its own, and `TemplateChip`, `TemplateEditor`, and `TemplatePreview` moved into `writer/templates/` (120 / 109 / 63 lines). The `toneLabel` helper travelled with the preview, which is its only consumer — it was left dead in the picker until pruned.

Both `codebase-audit` (F11) and `conventions-audit` (F17) routed this here.

### F12 — FIXED: the navbar lives in a layout

Introduced `src/app/(hub)/` holding home, the tools directory, categories, blog, newsletter, and shop, with a group layout rendering `HubNavbar` once. It came out of twelve page components.

A route group rather than the root layout, because tool routes need `AppNavbar` (per-tool brand and actions) instead — so the two navbars stay siblings rather than one wrapping the other. **Every URL is unchanged** (parens don't affect paths); the build's route table was diffed to confirm `/`, `/tools`, `/blog`, `/categories/*`, and all nine tool routes resolve exactly as before.

This also addresses `performance-audit` F5, which deferred here.

### F7 — FIXED: only the newsletter form is a client component

The whole marketing section carried `"use client"` while only the form needed it — and it renders on nearly every page, so the decorative shell was shipped to the browser for nothing. Split into a Server Component shell (heading, copy, the two blurred gradient divs) and a `NewsletterForm` client leaf.

The success branch became an early return rather than a ternary, which is what let the shell stay server-rendered.

### F10 — FIXED: `Tooltip` no longer opts into the client

It is pure CSS — `group-hover` / `group-focus-within`, no hook, handler, or browser API. The directive was doing nothing but adding to the client bundle wherever a tooltip appears (the navbar, the share bar, the usage pill).

### F6 — FIXED (by the environment pass): usage config no longer needs a round-trip

`getRateLimitStatus()` now answers from `hasRedisCredentials()` without constructing a client, so the Server Action the pill calls is cheap. The effect remains, deliberately: the value is per-deployment config, but the pill also listens for BYOK changes, so it has to be a client component regardless.

### Closed by earlier passes

| ID  | Closed by        | How                                                                                           |
| --- | ---------------- | --------------------------------------------------------------------------------------------- |
| F2  | performance pass | React `cache()` on the loaders — the footer had been re-parsing every MDX file on every route |
| F4  | security pass    | Every Server Action parses a bounded Zod schema first                                         |
| F5  | redis pass       | Newsletter action metered, honeypotted, and non-oracular                                      |
| F9  | conventions pass | The nine tool layouts render `ToolRouteLayout`, which uses the shared `JsonLdScript`          |

## Not fixed, and why

### F1 — REJECTED: removing `runtime = "edge"` does not restore static generation

The finding's premise is false, and testing is what showed it. Removing the directive leaves the route `ƒ Dynamic` — **non-parameterized image routes are dynamic either way**, which is exactly why the three `[slug]` OG routes prerender (`●`) and every fixed-path one doesn't. Edge isn't required either; those routes build fine on Node.

There is no static-generation win to claim here. The real defect was three contradictory comments asserting edge was mandatory, fixed during the codebase pass: all 26 routes now carry one accurate note, and the six content-backed image routes explain why they must stay on Node (`node:fs` via `createMdxLoader`).

### F3 — NOT VIABLE: `"use cache"` can't wrap an image route

The finding is right that the per-slug OG routes have `generateStaticParams` and still build `ƒ Dynamic`. Its proposed fix doesn't work: adding `"use cache"` to the `Image` function fails the build with

> Only plain objects, and a few built-ins, can be passed to Client Components from Server Components.

because an `ImageResponse` isn't serializable across a cache boundary. Verified, then reverted.

So social scrapes do re-render Satori, and there is no in-framework fix available at this Next version. If it becomes a real cost, the answer is generating the cards as files at build time rather than as routes — a different design, not a directive.

### F11 — ACCEPTED: manual memoization stays

`useMemo`/`useCallback` alongside the React Compiler is redundant in most cases, but stripping ~30 call sites is a broad, behaviour-adjacent edit with no measurable win and real risk of changing identity semantics something depends on. Worth doing as its own deliberate change if the compiler's coverage is verified first.

### F13 — REJECTED: the index keys are safe here

`performance-audit` examined the same code and dropped this finding after checking: the SEO variations are only ever updated in place, never reordered, inserted, or removed. An index key is stable under those operations. Two audits reaching different conclusions from the same lines is worth recording; the one that traced the mutations is the one to trust.

### F14 — ACCEPTED: one `ui` barrel

`@/components/ui` does mix client-boundary components with server-renderable ones. Splitting it into `ui/client` and `ui/server` would leak an implementation detail into every import path, and Next already handles the boundary correctly — a Server Component importing `Button` doesn't drag the client runtime in unless it renders something that needs it. F10 (dropping an unnecessary `"use client"`) is the version of this worth doing: fewer client leaves, not more barrels.

## Verification

`pnpm exec tsc --noEmit`, `pnpm lint` (zero warnings), and `pnpm build` all pass. The route table was compared before and after the `(hub)` group move to confirm no URL changed.

## Scorecard

| Category               | Score | Δ   | Notes                                                                                      |
| ---------------------- | ----- | --- | ------------------------------------------------------------------------------------------ |
| Router hygiene         | 9/10  | +2  | Thin entries, a group layout owning the shared navbar, accurate runtime comments.          |
| Caching                | 7/10  | +3  | Per-request dedupe on the loaders. Image routes can't be cached at this Next version (F3). |
| Mutations              | 10/10 | +4  | Zod at every action boundary, all of them metered.                                         |
| Server/client boundary | 9/10  | +3  | Newsletter split to a server shell, `Tooltip` off the client entirely.                     |
| Page structure         | 9/10  | +3  | Largest component down from 501 to 245 lines; navbar in a layout.                          |
| React idioms           | 8/10  | —   | No effect-driven state, no `forwardRef`. Manual memoization retained deliberately (F11).   |

## Remaining action items

| #   | Priority | Task                                                                                                      | Effort |
| --- | -------- | --------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P3       | Verify React Compiler coverage, then remove the redundant `useMemo`/`useCallback` as its own change (F11) | M      |
| 2   | P3       | If OG rendering cost shows up, generate social cards at build time rather than as routes (F3)             | M      |
| 3   | P3       | The three remaining files over ~200 lines (454 / 391 / 373) — same treatment as `TemplatesPicker` (F8)    | M      |
