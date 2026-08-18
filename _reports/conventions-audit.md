# Conventions audit — The Productivity Bug (single Next.js 16 app)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** fixes applied · **Branch:** `feat/the-productivity-bug` · **Scope:** whole repo (`src/app`, `src/components`, `src/lib`, `src/styles`, config), audited against `AGENTS.md` + the house `naming` / `code-structure` standards · **Overall:** 9/10

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | 7/10     | 9/10    | +2  | ▲     |

First run — no prior `_reports/conventions-audit.md`, so every finding is `NEW` and the "Resolved since last audit" section is empty.

**Headline:** the refactor landed cleanly in `src/lib` (explicit kind barrels, no `export *` outside the sanctioned `ui/index.ts`, namespaced storage keys/events, `server-only` boundary respected, no client component reaching past `lib/server/actions`) and in the content routes (`/blog`, `/newsletter`, `/shop` all build paths from `ROUTES` and copy from `lib/data`). The `(tools)` route group did **not** get the same treatment: nine ~100-line `layout.tsx` files hardcode tool paths, re-declare registry data, and duplicate the JSON-LD script the shared `JsonLdScript` already owns. Two duplicated sources of truth (an article-length limit, a history factory) are the highest-risk items. `pnpm exec tsc --noEmit` and `pnpm lint` both pass clean.

## Findings

| ID  | Severity | Category                       | Status       | Issue                                                                                                                                      | Location                                                      |
| --- | -------- | ------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| 1   | HIGH     | Hardcoded values               | **FIXED**    | Nine tool layouts hardcode their route path as `TOOL_PATH` instead of `ROUTES.tool()` / `TOOLS[].href`                                     | `src/app/(tools)/*/layout.tsx:13`                             |
| 2   | HIGH     | Duplication / Placement        | **FIXED**    | Tool metadata + JSON-LD boilerplate duplicated nine times in fat route layouts; tool copy has four competing sources of truth              | `src/app/(tools)/word-counter/layout.tsx:1-98`                |
| 3   | HIGH     | Duplication / Hardcoded values | **FIXED**    | `DEFAULT_MAX_CHARS = 15000` in a component shadows `MAX_ARTICLE_INPUT_CHARS = 15_000` — two sources of truth for the same limit            | `src/components/_shared/source/ArticleSourceInput.tsx:11`     |
| 4   | HIGH     | Duplication                    | **FIXED**    | `use-seo-meta-history.ts` hand-rolls the whole `createToolHistory` factory instead of calling it, and the two copies have already diverged | `src/lib/hooks/use-seo-meta-history.ts:29-57`                 |
| 5   | MEDIUM   | Hardcoded values               | **FIXED**    | `SITE_NAME` written as the literal `"The Productivity Bug"` in 13 OG-image route files                                                     | `src/app/blog/opengraph-image.tsx:8`                          |
| 6   | MEDIUM   | Duplication                    | **FIXED**    | The `ItemList` JSON-LD builder is copy-pasted across three section pages                                                                   | `src/components/blog/index.tsx:13-23`                         |
| 7   | MEDIUM   | Duplication                    | **FIXED**    | OG-image copy re-types page copy that already lives in `lib/data` verbatim                                                                 | `src/app/blog/opengraph-image.tsx:19-20`                      |
| 8   | MEDIUM   | Duplication                    | **FIXED**    | Home page inlines `PageMain`'s exact class string instead of using the primitive                                                           | `src/components/home/index.tsx:16`                            |
| 9   | MEDIUM   | Naming                         | **FIXED**    | Env Zod schema is named `schema` — no `Schema` suffix, and non-descriptive                                                                 | `src/lib/config/env.ts:7`                                     |
| 10  | MEDIUM   | Naming                         | **FIXED**    | A cluster of noun-named / vague / built-in-shadowing identifiers (`historyLabel`, `status`, `mask`, `PRESENT`, `VALID`, `URL`, …)          | `src/app/(tools)/tools/page.tsx:8`                            |
| 11  | MEDIUM   | Naming                         | **FIXED**    | Six props types named bare `type Props`, and `type IconComponent` re-declared in six files                                                 | `src/components/_shared/result/ArticleCard.tsx:14`            |
| 12  | MEDIUM   | Placement                      | **FIXED**    | Constants and shared types live in `components/`, which the standard reserves for `.tsx` only                                              | `src/components/tools/article-to-seo-meta/SeoMetaForm.tsx:22` |
| 13  | MEDIUM   | Placement                      | **FIXED**    | `lib/config/` is the one kind with no barrel, and it hides a `server-only` module (`env.ts`) inside the client-safe tree                   | `src/lib/config/env.ts:3`                                     |
| 14  | MEDIUM   | Hardcoded values               | **FIXED**    | Sender.net endpoint, API version, and group IDs hardcoded inside the action                                                                | `src/lib/server/actions/newsletter.action.ts:8-12`            |
| 15  | MEDIUM   | Placement                      | **FIXED**    | AI output Zod schemas live in `services/`, not `lib/schemas/`, and ship through the same barrel as content loaders                         | `src/lib/server/services/seo-meta.service.ts:30`              |
| 16  | MEDIUM   | Placement                      | **FIXED**    | Barrel usage is inconsistent, and `create-tool-history.utils.ts` imports its own kind's barrel (import cycle)                              | `src/lib/utils/writer/create-tool-history.utils.ts:10`        |
| 17  | MEDIUM   | Placement                      | **ROUTED**   | Three component files well over the ~200-line guide, mixing several components, constants, and pure helpers                                | `src/components/_shared/writer/TemplatesPicker.tsx`           |
| 18  | MEDIUM   | Placement                      | **FIXED**    | Parallel tools place their history type asymmetrically — one in `types/`, one in `hooks/`                                                  | `src/lib/hooks/use-seo-meta-history.ts:16`                    |
| 19  | LOW      | Hardcoded values               | **FIXED**    | OG accent/background hex values repeated raw across ~20 route files with no named palette                                                  | `src/app/blog/opengraph-image.tsx:20-21`                      |
| 20  | LOW      | Placement                      | **FIXED**    | `ROUTES` is one flat map rather than grouped by route section                                                                              | `src/lib/config/routes.ts:12`                                 |
| 21  | LOW      | Placement                      | **REJECTED** | `lib/` nests inside kinds (`utils/text/`, `hooks/writer/`, `server/utils/ai/`) against the standard's flat-inside-a-kind rule              | `src/lib/utils/text/`                                         |
| 22  | LOW      | Placement                      | **FIXED**    | MDX components registered in the global MDX map live in the `blog` feature folder                                                          | `src/mdx-components.tsx:6-8`                                  |
| 23  | LOW      | Hardcoded values               | **FIXED**    | `manifest.ts` hardcodes a brand hex and a short name with no token/constant behind them                                                    | `src/app/manifest.ts:14-24`                                   |
| 24  | LOW      | Hardcoded values               | **FIXED**    | `/opengraph-image` route suffix concatenated by hand in three JSON-LD blocks                                                               | `src/components/blog/post/index.tsx:37`                       |
| 25  | LOW      | Hardcoded values               | **FIXED**    | `LLM_MODEL` (a non-secret) is read from the environment rather than from a committed config module                                         | `src/lib/config/env.ts:15`                                    |

## What was applied

### F1 + F2 — FIXED: nine fat tool layouts became nine thin ones

Each layout hardcoded `const TOOL_PATH = "/<slug>"` and carried ~70 lines of duplicated `Metadata` + `WebApplication` JSON-LD, re-inlining the escaping `JsonLdScript` already owns.

Now:

- **`src/lib/data/tool-seo.data.ts`** holds each tool's SEO copy (title, description, application name, alternate name, subcategory, keywords, feature list) — one entry per tool, extracted verbatim from the layouts.
- **`buildToolMetadata(slug)`** and **`buildToolJsonLd(slug)`** in `lib/utils/tool-seo.utils.ts` build both artefacts, taking the path from `ROUTES.tool(slug)` — no literal paths anywhere.
- **`ToolRouteLayout`** applies the `tool-<slug>` brand scope and injects the JSON-LD through `JsonLdScript`.

A layout is now 18 lines: a slug constant, `export const metadata = buildToolMetadata(SLUG)`, and a render of `ToolRouteLayout`. All nine brand-scope classes were verified to be exactly `tool-<slug>` before switching to a derived class, and the built HTML was inspected afterwards to confirm the emitted JSON-LD is identical.

### F3 — FIXED: one character cap

`DEFAULT_MAX_CHARS = 15000` deleted; `ArticleSourceInput` defaults `maxChars` to `MAX_ARTICLE_INPUT_CHARS`, so the on-screen counter and the server's `ARTICLE_TOO_LONG` guard can no longer drift apart.

### F4 — FIXED (codebase pass): the history factory is called, not reimplemented

### F5 + F7 + F19 — FIXED: OG routes stopped restating what already exists

- The literal `"The Productivity Bug"` in 13 route files is now `SITE_NAME`.
- The three section cards take their subtitle from `BLOG_PAGE_COPY` / `NEWSLETTER_PAGE_COPY` / `SHOP_PAGE_COPY` instead of a re-typed copy of the same sentence.
- The raw accent/background hexes across 13 routes became a named palette, `OG_PALETTES` in `constants/og.constant.ts`, applied as `...OG_PALETTES.teal`. The palette documents why the values stay literal rather than becoming CSS tokens: an `ImageResponse` renders in an isolated document with no access to the site stylesheet.

### F6 + F24 — FIXED: shared JSON-LD builders

`buildItemListJsonLd(section, items)` replaces three copy-pasted `ItemList` literals, and `ogImageUrl(path)` replaces the `/opengraph-image` suffix concatenated by hand in three detail pages.

### F8 — FIXED: the home page uses `PageMain`

It previously inlined that primitive's exact class string.

### F9 — FIXED: `EnvSchema`

The env Zod schema was named `schema` — no `Schema` suffix and not descriptive.

### F11 — FIXED: shared `IconComponent`, named props types

`type IconComponent` was re-declared identically in six files; it now lives once in `types/ui.type.ts`. Six bare `type Props` declarations were renamed after their components (`ArticleCardProps`, `PostCardProps`, …), per the house `Props`-suffix rule.

### F13 — FIXED: `lib/config/` has a barrel, and it deliberately excludes `env`

`config/index.ts` now exists like every other kind. **`env.ts` is deliberately not re-exported**, and the file says why: it is `server-only`, so putting it in an otherwise client-safe barrel would let a client component reach server-only code through it. It keeps the `@env` alias for that reason.

### F14 — FIXED: the Sender.net endpoint is config

`SENDER_SUBSCRIBERS_URL` joins `SENDER_GROUP_IDS` in `config/site.ts`, so the versioned path is one edit rather than a literal inside the action. (The group ids moved during the environment pass.)

### F16 — FIXED: an import cycle removed

`create-tool-history.utils.ts` imported `@/lib/utils` — its own kind's barrel — pulling the kind back through itself. It now imports its three siblings directly, with a comment explaining why a util must not import its own barrel.

### F23 — FIXED: manifest values are constants

`SITE_SHORT_NAME`, `SITE_THEME_COLOR`, and `SITE_BACKGROUND_COLOR` live in `config/site.ts`, with a note that the colours stay literal because a manifest is JSON with no stylesheet access.

### F10, F12, F15, F18, F20, F22 — FIXED

Naming and placement clean-up: noun-named functions and built-in-shadowing identifiers renamed; constants and shared types moved out of `components/` into their kinds; the AI output schemas moved from `services/` into `lib/schemas/` so they no longer ship through the content-loader barrel; the two tools' history types placed symmetrically; `ROUTES` grouped by section rather than one flat map; and the globally-registered MDX components moved out of the `blog` feature folder.

## Not fixed, and why

### F21 — REJECTED: nested folders inside a kind are the standard, not a violation

The finding reads `utils/text/`, `hooks/writer/`, and `server/utils/ai/` as breaking the "flat inside a kind" rule. The `code-structure` standard says the opposite in as many words:

> **A domain that outgrows one file becomes a folder inside its kind** — every kind, not just clients. The folder carries the domain, so the files inside carry only the concern.

It even gives `services/event/{crud,member,publishing}.service.ts` as the worked example. `utils/text/case.utils.ts` is exactly that shape. No change made.

### F17 — ROUTED to `frontend-audit`

Three component files well over the ~200-line guide, `TemplatesPicker` (501 lines, five components) worst among them. Same item as `codebase-audit` F11, and owned by the frontend pass.

## Verification

`pnpm exec tsc --noEmit`, `pnpm lint` (zero warnings), and `pnpm build` all pass. The tool pages' built HTML was compared before and after the layout refactor to confirm the JSON-LD output is byte-identical.

## Scorecard

| Category         | Score | Δ   | Notes                                                                                                                                                                                                          |
| ---------------- | ----- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hardcoded values | 10/10 | +4  | No literal route paths; OG palette, manifest colours, the Sender endpoint, and the character cap all read from config or constants.                                                                            |
| Duplication      | 9/10  | +4  | The nine-way layout duplication, three `ItemList` literals, six `IconComponent` declarations, and the hand-rolled history factory are all gone.                                                                |
| Naming           | 9/10  | +3  | `Schema` suffix on the env schema, props types named after their components, verb-first functions, no built-in shadowing.                                                                                      |
| Placement        | 9/10  | +3  | Every kind now has a barrel (with `env` deliberately outside the client-safe one), schemas moved to `lib/schemas`, and the util import cycle removed. Oversized components remain, routed to `frontend-audit`. |

## Remaining action items

### Backlog

| #   | Priority | Task                                                                                            | Effort |
| --- | -------- | ----------------------------------------------------------------------------------------------- | ------ |
| 1   | P2       | Split the three oversized components, `TemplatesPicker` first (F17) — owned by `frontend-audit` | M      |
