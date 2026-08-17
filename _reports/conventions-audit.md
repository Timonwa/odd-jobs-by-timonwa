# Conventions audit — The Productivity Bug (single Next.js 16 app)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `feat/the-productivity-bug` · **Scope:** whole repo (`src/app`, `src/components`, `src/lib`, `src/styles`, config), audited against `AGENTS.md` + the house `naming` / `code-structure` standards · **Overall:** 7/10

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | N/A      | 7/10    | N/A | N/A   |

First run — no prior `_reports/conventions-audit.md`, so every finding is `NEW` and the "Resolved since last audit" section is empty.

**Headline:** the refactor landed cleanly in `src/lib` (explicit kind barrels, no `export *` outside the sanctioned `ui/index.ts`, namespaced storage keys/events, `server-only` boundary respected, no client component reaching past `lib/server/actions`) and in the content routes (`/blog`, `/newsletter`, `/shop` all build paths from `ROUTES` and copy from `lib/data`). The `(tools)` route group did **not** get the same treatment: nine ~100-line `layout.tsx` files hardcode tool paths, re-declare registry data, and duplicate the JSON-LD script the shared `JsonLdScript` already owns. Two duplicated sources of truth (an article-length limit, a history factory) are the highest-risk items. `pnpm exec tsc --noEmit` and `pnpm lint` both pass clean.

## Findings

| ID  | Severity | Category                       | Status | Issue                                                                                                                                      | Location                                                      |
| --- | -------- | ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| 1   | HIGH     | Hardcoded values               | NEW    | Nine tool layouts hardcode their route path as `TOOL_PATH` instead of `ROUTES.tool()` / `TOOLS[].href`                                     | `src/app/(tools)/*/layout.tsx:13`                             |
| 2   | HIGH     | Duplication / Placement        | NEW    | Tool metadata + JSON-LD boilerplate duplicated nine times in fat route layouts; tool copy has four competing sources of truth              | `src/app/(tools)/word-counter/layout.tsx:1-98`                |
| 3   | HIGH     | Duplication / Hardcoded values | NEW    | `DEFAULT_MAX_CHARS = 15000` in a component shadows `MAX_ARTICLE_INPUT_CHARS = 15_000` — two sources of truth for the same limit            | `src/components/_shared/source/ArticleSourceInput.tsx:11`     |
| 4   | HIGH     | Duplication                    | NEW    | `use-seo-meta-history.ts` hand-rolls the whole `createToolHistory` factory instead of calling it, and the two copies have already diverged | `src/lib/hooks/use-seo-meta-history.ts:29-57`                 |
| 5   | MEDIUM   | Hardcoded values               | NEW    | `SITE_NAME` written as the literal `"The Productivity Bug"` in 13 OG-image route files                                                     | `src/app/blog/opengraph-image.tsx:8`                          |
| 6   | MEDIUM   | Duplication                    | NEW    | The `ItemList` JSON-LD builder is copy-pasted across three section pages                                                                   | `src/components/blog/index.tsx:13-23`                         |
| 7   | MEDIUM   | Duplication                    | NEW    | OG-image copy re-types page copy that already lives in `lib/data` verbatim                                                                 | `src/app/blog/opengraph-image.tsx:19-20`                      |
| 8   | MEDIUM   | Duplication                    | NEW    | Home page inlines `PageMain`'s exact class string instead of using the primitive                                                           | `src/components/home/index.tsx:16`                            |
| 9   | MEDIUM   | Naming                         | NEW    | Env Zod schema is named `schema` — no `Schema` suffix, and non-descriptive                                                                 | `src/lib/config/env.ts:7`                                     |
| 10  | MEDIUM   | Naming                         | NEW    | A cluster of noun-named / vague / built-in-shadowing identifiers (`historyLabel`, `status`, `mask`, `PRESENT`, `VALID`, `URL`, …)          | `src/app/(tools)/tools/page.tsx:8`                            |
| 11  | MEDIUM   | Naming                         | NEW    | Six props types named bare `type Props`, and `type IconComponent` re-declared in six files                                                 | `src/components/_shared/result/ArticleCard.tsx:14`            |
| 12  | MEDIUM   | Placement                      | NEW    | Constants and shared types live in `components/`, which the standard reserves for `.tsx` only                                              | `src/components/tools/article-to-seo-meta/SeoMetaForm.tsx:22` |
| 13  | MEDIUM   | Placement                      | NEW    | `lib/config/` is the one kind with no barrel, and it hides a `server-only` module (`env.ts`) inside the client-safe tree                   | `src/lib/config/env.ts:3`                                     |
| 14  | MEDIUM   | Hardcoded values               | NEW    | Sender.net endpoint, API version, and group IDs hardcoded inside the action                                                                | `src/lib/server/actions/newsletter.action.ts:8-12`            |
| 15  | MEDIUM   | Placement                      | NEW    | AI output Zod schemas live in `services/`, not `lib/schemas/`, and ship through the same barrel as content loaders                         | `src/lib/server/services/seo-meta.service.ts:30`              |
| 16  | MEDIUM   | Placement                      | NEW    | Barrel usage is inconsistent, and `create-tool-history.utils.ts` imports its own kind's barrel (import cycle)                              | `src/lib/utils/writer/create-tool-history.utils.ts:10`        |
| 17  | MEDIUM   | Placement                      | NEW    | Three component files well over the ~200-line guide, mixing several components, constants, and pure helpers                                | `src/components/_shared/writer/TemplatesPicker.tsx`           |
| 18  | MEDIUM   | Placement                      | NEW    | Parallel tools place their history type asymmetrically — one in `types/`, one in `hooks/`                                                  | `src/lib/hooks/use-seo-meta-history.ts:16`                    |
| 19  | LOW      | Hardcoded values               | NEW    | OG accent/background hex values repeated raw across ~20 route files with no named palette                                                  | `src/app/blog/opengraph-image.tsx:20-21`                      |
| 20  | LOW      | Placement                      | NEW    | `ROUTES` is one flat map rather than grouped by route section                                                                              | `src/lib/config/routes.ts:12`                                 |
| 21  | LOW      | Placement                      | NEW    | `lib/` nests inside kinds (`utils/text/`, `hooks/writer/`, `server/utils/ai/`) against the standard's flat-inside-a-kind rule              | `src/lib/utils/text/`                                         |
| 22  | LOW      | Placement                      | NEW    | MDX components registered in the global MDX map live in the `blog` feature folder                                                          | `src/mdx-components.tsx:6-8`                                  |
| 23  | LOW      | Hardcoded values               | NEW    | `manifest.ts` hardcodes a brand hex and a short name with no token/constant behind them                                                    | `src/app/manifest.ts:14-24`                                   |
| 24  | LOW      | Hardcoded values               | NEW    | `/opengraph-image` route suffix concatenated by hand in three JSON-LD blocks                                                               | `src/components/blog/post/index.tsx:37`                       |
| 25  | LOW      | Hardcoded values               | NEW    | `LLM_MODEL` (a non-secret) is read from the environment rather than from a committed config module                                         | `src/lib/config/env.ts:15`                                    |

### F1 — Nine tool layouts hardcode their own route path

- **What:** every file under `src/app/(tools)/<slug>/layout.tsx` opens with `const TOOL_PATH = "/<slug>";` (line 13 in all nine) and derives `TOOL_URL`, `alternates.canonical`, and the JSON-LD `url` from it. `ROUTES.tool(slug)` exists in `src/lib/config/routes.ts:19` and `TOOLS[].href` in `src/lib/config/tools.ts:119`, and the content routes (`src/app/blog/page.tsx:8`, `src/app/shop/page.tsx`, `src/app/(tools)/tools/page.tsx:7`) do use `ROUTES`. Verified across all nine layouts by grep: `article-to-seo-meta`, `article-to-social-posts`, `case-converter`, `hash-generator`, `lorem-ipsum`, `reading-time`, `slug-generator`, `svg-to-jsx`, `word-counter`.
- **Why it matters:** `AGENTS.md` ("Routing") states outright: "All page paths come from `ROUTES` in `lib/config/routes.ts` — never hardcode a path." A tool slug change today edits `tools.ts` and the folder name but silently leaves nine canonical URLs and nine JSON-LD `url` fields pointing at the old path — a canonical-tag/structured-data mismatch that search engines act on.
- **Fix:** in each layout derive the path once from the registry — `const tool = getToolBySlug("word-counter")` (`tools.ts:139`) and use `tool.href`, or `ROUTES.tool(slug)`. Better, fold it into the F2 helper so no layout builds a path at all.

### F2 — Fat tool layouts duplicate metadata + JSON-LD nine times, and tool copy has four owners

- **What:** the nine tool layouts are structurally identical, differing only in data. `diff` of `word-counter/layout.tsx` against `slug-generator/layout.tsx` (with names normalized) shows the only changes are string values — the `Metadata` object, the `WebApplication` JSON-LD skeleton, and the `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />` block are byte-identical in all nine (98-114 lines each). That escape expression is exactly what the shared `JsonLdScript` (`src/components/_shared/content/JsonLdScript.tsx`) exists for and is used for in six other places. On top of that, one tool's marketing copy now lives in four spots: the registry (`tools.ts` `name`/`tagline`), the layout (`TOOL_TITLE`, `TOOL_DESCRIPTION`, JSON-LD `name`/`keywords`/`featureList`), the OG route (`src/app/(tools)/word-counter/opengraph-image.tsx` `alt`/`eyebrow`/`subtitle`/`pills`), and the page content (`src/components/tools/word-counter/index.tsx` re-passes `name="Word & Character Counter"` and `icon={WholeWordIcon}` that `getToolBySlug` could supply).
- **Why it matters:** `AGENTS.md` requires thin entries — "`page.tsx` holds only framework surface" and the standard extends that to layouts — and requires reuse of the shared layer before adding plumbing. As it stands, renaming a tool is a five-file edit with no compiler help, and the escaping logic is forked nine ways from the component that is documented as the single JSON-LD escape point (`AGENTS.md` → Security: "JSON-LD is escaped via `JsonLdScript`").
- **Fix:** move the per-tool strings into `lib/data/<slug>.data.ts` (or extend the `TOOLS` entry with `seo: { title, description, keywords, featureList }`), add `buildToolMetadata(slug)` and `buildToolJsonLd(slug)` helpers, and reduce each layout to the brand-scope wrapper plus `<JsonLdScript data={buildToolJsonLd(slug)} />`. Have `ClientToolPage`/`AiToolPage` take only `slug` and read `name`/`icon` via `getToolBySlug`.

### F3 — Two constants for one article-length limit

- **What:** `src/lib/constants/article.constant.ts:4` defines `MAX_ARTICLE_INPUT_CHARS = 15_000` and it is the value the server enforces (`src/lib/server/utils/ai/article-source-validation.utils.ts:60` throws `ARTICLE_TOO_LONG` above it). `src/components/_shared/source/ArticleSourceInput.tsx:11` independently defines `const DEFAULT_MAX_CHARS = 15000` and uses it as the default for the `maxChars` prop that drives the on-screen counter and the `over` warning (lines 45, 55, 106).
- **Why it matters:** the two callers that render this input happen to pass `maxChars={MAX_ARTICLE_INPUT_CHARS}` explicitly today, so the numbers agree by luck. Lower the real constant to, say, 10 000 and any future caller that omits the prop shows users a 15 000-character budget the server rejects — a hard-to-diagnose "it said it was fine" failure. It also breaks the placement rule that constants live in `lib/constants/`.
- **Fix:** delete `DEFAULT_MAX_CHARS` and default the prop to `MAX_ARTICLE_INPUT_CHARS` imported from `@/lib/constants` (or make `maxChars` required).

### F4 — The SEO-meta history hook re-implements the shared history factory

- **What:** `src/lib/utils/writer/create-tool-history.utils.ts` is a factory that wires `createLocalStorageJson` + `createHistoryStore`, dedupes by `articleSourceIdentity`, and caps at `MAX_HISTORY_ENTRIES`. `src/lib/hooks/writer/use-social-posts-history.ts` uses it in five lines. `src/lib/hooks/use-seo-meta-history.ts:29-57` instead repeats the same body inline — same `createLocalStorageJson` call, same `applyUpsert` with the same `find`/`filter` on `articleSourceIdentity`, same `.slice(0, MAX_HISTORY_ENTRIES)`. The copies have already drifted: the social-posts entry guard also checks `!!result` (`use-social-posts-history.ts:14`), the SEO one does not.
- **Why it matters:** `AGENTS.md` → "Reuse the shared layer" names these factories explicitly. Two implementations of one persistence contract means every future fix (a migration, a cap change, a corrupt-entry guard) has to be found and applied twice, and the existing divergence proves that is already failing.
- **Fix:** rewrite `useSeoMetaHistory` as `createToolHistory<SeoMetaHistory>({ key: STORAGE_KEYS.seoMetaHistory, isEntry: isSeoMetaHistoryEntry })` and drop the inline store wiring.

### F5 — The site name is a literal in 13 OG route files

- **What:** `SITE_NAME` is defined in `src/lib/config/site.ts:9` and imported by ~19 route files for `metadata`. The OG-image routes instead spell it out: `src/app/opengraph-image.tsx:15`, `blog/opengraph-image.tsx:8,14`, `blog/[slug]/opengraph-image.tsx:9,28`, `shop/opengraph-image.tsx:8,14`, `shop/[slug]/opengraph-image.tsx:9,28`, `newsletter/opengraph-image.tsx:8,14`, `newsletter/[slug]/opengraph-image.tsx:9,30-31` — 13 occurrences of `"The Productivity Bug"`.
- **Why it matters:** the config module documents itself as "Edit here to change the whole site," which is now false. A rename ships inconsistent OG cards and alt text with no build error.
- **Fix:** import `SITE_NAME` and interpolate (`alt = \`Blog — ${SITE_NAME}\``, `eyebrow: \`Blog · ${SITE_NAME}\``).

### F6 — `ItemList` JSON-LD built three times

- **What:** `src/components/blog/index.tsx:13-23`, `src/components/newsletter/index.tsx:13-23`, and `src/components/shop/index.tsx:13-23` contain the same 11-line builder — same `@type: "ItemList"`, same `name: \`<Section> — ${SITE_NAME}\``, same `itemListElement`map producing`position`/`url`/`name`. Only the collection and the `ROUTES` builder differ.
- **Why it matters:** three places to keep in sync for one structured-data shape; a schema.org correction has to be applied three times or the sections disagree.
- **Fix:** one helper — `buildItemListJsonLd({ name, items })` in `lib/utils/` (or `lib/server/utils/` if it stays server-side) — called by all three.

### F7 — OG routes retype copy that already lives in `lib/data`

- **What:** `BLOG_PAGE_COPY.description` (`src/lib/data/blog.data.ts:5`) is "Practical tips, systems, and ideas on productivity and workflow — to help you get more done." The identical sentence is retyped as the `subtitle` in `src/app/blog/opengraph-image.tsx:19-20`. The data module's own comment says it is "shared by the route metadata and the hero" — the OG route was left out.
- **Why it matters:** the section-copy pattern exists precisely so one edit updates page metadata, hero, and social card; a partial adoption produces an OG card that contradicts the page.
- **Fix:** import `BLOG_PAGE_COPY` / `NEWSLETTER_PAGE_COPY` / `SHOP_PAGE_COPY` in the matching OG routes, and add the OG-only strings (`eyebrow`, `pills`, `titleLead`, `titleAccent`) to those same `*_PAGE_COPY` records.

### F8 — Home page inlines the `PageMain` container

- **What:** `src/components/ui/layouts/PageMain/index.tsx` owns the container class string `"container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl"`. `src/components/home/index.tsx:16` renders its own `<main>` with that exact string instead of `<PageMain>`; every other PageContent (`blog`, `newsletter`, `shop`, `categories`, `tools`, both tool shells) uses the primitive.
- **Why it matters:** `PageMain`'s docstring claims it "owns max-width and padding so every page aligns," which the home page silently opts out of. A container change now misaligns the landing page against the rest of the site.
- **Fix:** replace the hand-written `<main>` with `<PageMain className="pb-20">` (pass overrides via `className`, which `PageMain` already merges with `cn`).

### F9 — Env Zod schema is named `schema`

- **What:** `src/lib/config/env.ts:7` — `const schema = z.object({...})`, parsed at line 29.
- **Why it matters:** the naming table in `AGENTS.md` requires "Zod schema (the value) → `Schema` suffix," and the repo honours it everywhere else (`PostFrontmatterSchema`, `SeoMetaSchema`, `EmailSchema`). A bare `schema` is also the vague-name case the standard bans.
- **Fix:** rename to `EnvSchema`.

### F10 — Noun-named, vague, and built-in-shadowing identifiers

- **What:** verified instances, all against "verb-first functions, descriptive over terse, booleans as assertions":
  - `src/app/(tools)/tools/page.tsx:8` — `const URL = \`${SITE_URL}${PATH}\``shadows the global`URL`constructor (used elsewhere in the codebase, e.g.`article-source-validation.utils.ts:37`); siblings `PATH`/`TITLE`/`DESCRIPTION` are equally generic.
  - Noun-named functions: `historyLabel` (`SeoMetaTool.tsx:40` **and** `Writer.tsx:13` — same name, two near-identical bodies), `toneLabel` (`TemplatesPicker.tsx:28`), `charCountClass` (`PostCard.tsx:28`), `status` (`SeoMetaResults.tsx:28`), `safeHttpUrl` (`ArticleCard.tsx:23`), `backgroundStyle`/`checker` (`SvgToJsxTool.tsx:64,56`), `articleSourceErrorRules` (exported, `article-source-validation.utils.ts:66`), `buttonClasses` (exported, `ui/base/Button/index.tsx:37`), `colorForTint` (`config/categories.ts:22`), `stringStore`/`flagStore` (`use-article-source.ts:22,40`), `titleCase`/`tokens`/`cap` (`text/case.utils.ts:101,22,31`), `codePoints` (`text/counts.utils.ts:12`), `randInt` (`text/lorem.utils.ts:103`), `jsxAttrFormatter` (`svg/svg-to-jsx.utils.ts:86`), `countIn` (`FilterableTools.tsx:18`), `mask` (`ByokSection.tsx:33`).
  - Vague constants: `PRESENT`, `VALID` (`FilterableTools.tsx:13,16`), `INITIAL` (`Newsletter.tsx:14`), `SAMPLE`, `DEFAULTS` (`SvgToJsxTool.tsx:19`, `LoremIpsumTool.tsx:25`), `BASE`/`CARD`/`LABEL` class-string constants (`Button`, `Badge`, `ToggleButton`, `OutputBlock`, `IssuePrevNext`).
- **Why it matters:** these read as data, not actions, so call sites don't say what happens (`status(len, min, max)` vs `getRangeStatus(...)`); `URL` shadowing a Web API is a live foot-gun the moment someone adds `new URL()` to that file; and `historyLabel` existing twice with different truncation lengths (120 vs 80) is drift hiding behind one name.
- **Fix:** rename verb-first and ownership-revealing (`formatHistoryLabel`, `getRangeStatus`, `buildButtonClasses`, `getCategoryColorForTint`, `maskApiKey`, `TOOLS_PAGE_URL`, `PRESENT_CATEGORIES`, `VALID_CATEGORY_IDS`, `INITIAL_NEWSLETTER_STATE`, `SAMPLE_SVG`, …) and hoist the single shared `formatHistoryLabel` into `lib/utils/writer/`.

### F11 — Bare `type Props` ×6 and `type IconComponent` ×6

- **What:** `type Props = {` in `SeoMetaResults.tsx:34`, `HistorySidebar.tsx:29`, `ArticleCard.tsx:14`, `HostedUsagePill.tsx:8`, `ArticleSourceInput.tsx:13`, `PostCard.tsx:35`. Separately, `type IconComponent = ComponentType<SVGProps<SVGSVGElement>>` is declared verbatim in `ui/patterns/Navbar/index.tsx:5`, `ui/patterns/Footer/index.tsx:7`, `ui/patterns/PageHero/index.tsx:6`, `_shared/page/ClientToolPage.tsx:9`, `_shared/page/AiToolPage.tsx:9`, `_shared/layout/AppNavbar.tsx:7`.
- **Why it matters:** the naming table requires props types to carry the component name (`SearchInputProps`); six identical `Props` symbols make grep and IDE navigation useless and read identically in error messages. Six copies of `IconComponent` is the duplicated-type case the standard sends to a shared kind.
- **Fix:** rename to `<Component>Props` in all six files; declare `IconComponent` once in `lib/types/` (e.g. `icon.type.ts`) and import it. Note the other 36 props types in the repo already follow the convention, so this is a consistency gap, not a systemic one.

### F12 — Constants and shared types inside `components/`

- **What:** `AGENTS.md` — "Components hold `.tsx` only — hooks/constants/types live in `lib/`." Violations: exported types `SeoMetaFormParams` (`tools/article-to-seo-meta/SeoMetaForm.tsx:22`, imported by `SeoMetaTool.tsx:22` and used as the shape handed to a server action), `BreadcrumbItem` (`ui/blocks/Breadcrumbs/index.tsx:11`), `IssueNav` (`_shared/content/IssuePrevNext.tsx:5`), `RelatedItem` (`_shared/content/RelatedGrid.tsx:6`), `SettingsPresentation` (`_shared/writer/settings/SettingsDrawer.tsx:15`) — the last three are re-exported through `_shared` barrels. Domain-ish constants: `DEFAULT_MAX_CHARS` (F3), `MAX_COUNT = 100` (`LoremIpsumTool.tsx:23`), `SLUG_LENGTH_TARGET = 60` (`SlugGeneratorTool.tsx:23`), `LOW_REMAINING = 2` (`HostedUsagePill.tsx:14`), `SOCIAL_LINKS` (`HubFooter.tsx:22`), `TILE_POSITIONS` (`WhatItIs.tsx:14`), `INDENTS`/`QUOTES`/`BACKGROUNDS`/`TABS`/`SAMPLE` (`SvgToJsxTool.tsx:19-53`).
- **Why it matters:** these are the values a reader expects to find by opening `lib/constants/` — the point of a kind-first `lib/`. `SLUG_LENGTH_TARGET` and `MAX_COUNT` are product rules invisible from the constants kind, and `SeoMetaFormParams` is a cross-file contract for a server-action payload living in a leaf component.
- **Fix:** move the domain constants to `lib/constants/<domain>.constant.ts` (SEO/slug/lorem limits, footer social links) and the cross-file types to `lib/types/`. Purely presentational class-string constants (`BASE`, `CARD`) can stay colocated.

### F13 — `lib/config/` has no barrel and hides a `server-only` module

- **What:** every other kind has an explicit barrel (`constants/index.ts`, `types/index.ts`, `utils/index.ts`, `hooks/index.ts`, `schemas/index.ts`, `data/index.ts`, `server/**/index.ts`), each with one export line per file exactly as `AGENTS.md` claims. `src/lib/config/` has none — all 114 imports are deep paths (`@/lib/config/routes`, `@/lib/config/site`, …). And `src/lib/config/env.ts:3` calls `import "server-only"` while sitting in that client-safe kind.
- **Why it matters:** the structure block in `AGENTS.md` promises "barrel per kind," so the documentation is inaccurate for the most-imported kind. More concretely, adding the missing `config/index.ts` would re-export `env.ts` and instantly break every client component that imports anything from `config` — the boundary rule ("Never share a barrel between server-only and client-safe code") is satisfied today only because the barrel is absent.
- **Fix:** either document the deep-path-only decision for `config/`, or add `config/index.ts` — and in that case move `env.ts` behind the server boundary (`lib/server/config/env.config.ts`, keeping the `@env` alias) so the barrel stays client-safe.

### F14 — Sender.net endpoint, version, and group IDs hardcoded in the action

- **What:** `src/lib/server/actions/newsletter.action.ts:8` — `const SENDER_API_BASE_URL = "https://api.sender.net/v2/subscribers"` (API version `v2` embedded in the string) and line 12 `const SENDER_GROUP_IDS = ["b6VOlQ", "dw5jLr"]`.
- **Why it matters:** the audit's rules put third-party endpoints in a config/endpoints module with the API version as its own constant, and opaque external IDs in a committed config keyed off `APP_ENV` (they're not secrets, so they don't belong in env either — but they also don't belong inline in a mutation). Today, pointing staging at a different list, or moving to `v3`, means editing a Server Action.
- **Fix:** add `lib/config/newsletter.ts` with `SENDER_API_VERSION`, a `SENDER_ENDPOINTS` group built from it, and `SENDER_GROUP_IDS` keyed off `APP_ENV`; the action imports them.

### F15 — AI output schemas live outside `lib/schemas/`

- **What:** `SeoMetaSchema` (`src/lib/server/services/seo-meta.service.ts:30`) and `SocialPostsSchema` (`src/lib/server/services/social-posts.service.ts:31`) with their inferred `SeoMetaOutput` / `SocialPostsOutput` types are declared in service modules and re-exported through `services/index.ts` and `lib/server/index.ts` alongside the content loaders (`getAllPosts`, `getProduct`, …). `lib/schemas/` holds only the three content-frontmatter schemas. `AGENTS.md` → Tech Stack lists just two Zod homes ("content frontmatter in `lib/schemas/`, env in `lib/config/env.ts`, action inputs in the action files") — agent output schemas are an undocumented third.
- **Why it matters:** the placement rule is that schemas and their inferred types live in the `schemas` kind so there is one place to look; here the server barrel's public surface mixes validation shapes with data loaders, and `SeoMetaOutput` sits far from the near-identical `SeoMetaResult` in `lib/types/seo-meta.type.ts`, making the relationship between the two shapes easy to miss.
- **Fix:** move both to `lib/schemas/seo-meta.schema.ts` / `social-posts.schema.ts` (they import nothing server-only — only `zod` and constants) and have the services import them; or, if they must stay server-side, document the third location in `AGENTS.md` and export them from a dedicated `lib/server/schemas/` barrel rather than `services`.

### F16 — Inconsistent barrel usage, including a cycle

- **What:** `src/lib/utils/writer/create-tool-history.utils.ts:10` imports `articleSourceIdentity`, `createHistoryStore`, `createLocalStorageJson` from `"@/lib/utils"` — its own kind's barrel, which re-exports this very file (`utils/index.ts` line for `createToolHistory`): a genuine `index.ts → create-tool-history.utils.ts → index.ts` cycle. Its siblings do the opposite and import by path (`storage/local-store.utils.ts:3`, `storage/byok.utils.ts:10`, `hosted-usage-signal.utils.ts:6`, `storage/create-writer-storage.utils.ts:10`). Meanwhile consumers in other kinds bypass the barrel for symbols it exports: `server/utils/create-mdx-loader.utils.ts:14,18` (`countWords`, reading-time helpers), `hooks/writer/use-social-posts-history.ts:5` (`createToolHistory` — while importing `isArticleSource` from the barrel two lines later), `hooks/writer/use-social-posts-style-templates.ts:10`, `hooks/writer/use-writer.ts:22`.
- **Why it matters:** the barrel is the documented public surface of a kind; three competing import styles for the same modules make it unclear which is canonical, and the self-referential import survives only because of ESM hoisting — reorder the barrel or add a module-scope side effect and it becomes an `undefined` at import time.
- **Fix:** one rule, applied — inside a kind, always import siblings by relative path (fixing the cycle); from another kind, always import the barrel.

### F17 — Oversized, multi-concern component files

- **What:** against the ~200-line guide and "one file per section/modal, stateful logic extracted to a `use-*` hook":
  - `src/components/_shared/writer/TemplatesPicker.tsx` — 501 lines holding five components (`TemplatesPicker`, `TemplateChip:254`, `TemplateEditor:359`, `TemplatePreview:453`, `Row:492`) and four `useState` blocks.
  - `src/components/tools/svg-to-jsx/SvgToJsxTool.tsx` — 454 lines: eight module constants, four pure helpers that belong in `lib/utils/svg/` (`backgroundStyle:64`, `sanitizeComponentName:70`, `readRootAttr:77`, `writeRootAttr:85`), eight `useState`, plus a second component (`SizeInput:430`).
  - `src/components/tools/article-to-seo-meta/SeoMetaTool.tsx` — 373 lines, 11 `useState` and six `useCallback`/`useEffectEvent` handlers inline, no extracted hook (contrast `useWriter`, which is exactly this pattern done right for the social-posts tool).
  - Also over the guide: `ShareBar.tsx` (274), `SeoMetaForm.tsx` (261), `GenerateForm.tsx` (207).
- **Why it matters:** these are the files a contributor has to read end-to-end to change one control, and the pure string helpers in `SvgToJsxTool` are untestable and unreusable where they sit even though a `lib/utils/svg/` folder already exists for them.
- **Fix:** split each nested component into its own file in the same folder; move the SVG root-attribute helpers to `lib/utils/svg/root-attrs.utils.ts` and the constants to `lib/constants/svg-to-jsx.constant.ts`; extract `SeoMetaTool`'s state into `lib/hooks/use-seo-meta-tool.ts` mirroring `useWriter`.

### F18 — Parallel tools, asymmetric type placement

- **What:** `SocialPostHistory` is declared in `src/lib/types/social-post.type.ts:52` and exported from the `types` barrel. Its exact counterpart `SeoMetaHistory` is declared in `src/lib/hooks/use-seo-meta-history.ts:16` and exported from the `hooks` barrel. Both are `HistoryEntry<…>` extensions for two tools built the same way. Similar drift: pure option shapes with no const or schema behind them (`SlugOptions`, `LoremOptions`, `SvgToJsxOptions`, `IndentUnit`) are exported from `utils` files rather than `types/`.
- **Why it matters:** the kind-first layout only pays off if a given kind of thing is always in the same place; here the answer to "where does a tool's history type live?" is "depends on the tool," and the `hooks` barrel exports a domain shape that isn't a hook.
- **Fix:** move `SeoMetaHistory` to `lib/types/seo-meta.type.ts` next to `SeoMetaResult` and export it from the `types` barrel; sweep the standalone option shapes into `types/` too, leaving in `utils/` only the types genuinely derived from a const in that file (`CaseOption`, `CaseGroup`).

### F19 — Raw OG palette hex values across ~20 route files

- **What:** every `opengraph-image.tsx` passes literal hex to `renderOgImage` — e.g. `accent: "#818cf8", backgroundTint: "#1e1b4b"` repeated identically in `src/app/opengraph-image.tsx:21-22`, `blog/opengraph-image.tsx:20-21`, `shop/opengraph-image.tsx:20-21`, `newsletter/opengraph-image.tsx:20-21`, with per-tool pairs in the nine tool routes. `src/styles/tokens.css` holds the design tokens and `lib/config/tints.ts` the tint scale; neither is referenced here.
- **Why it matters:** unexplained literals with no named owner — a brand accent change means grepping hex strings across 20 route files, and the four-way-repeated indigo pair is the site default with no single definition.
- **Fix:** add `OG_PALETTES` (e.g. `lib/constants/og.constant.ts`) with a `default` entry and one per tool/section keyed by slug, and have each route spread from it.

### F20 — `ROUTES` is a flat map

- **What:** `src/lib/config/routes.ts:12-28` is one object with 12 keys spanning every section (`home`, `tools`, `categories`, `category`, `toolsCategory`, `tool`, `blog`, `post`, `newsletter`, `issue`, `shop`, `product`).
- **Why it matters:** the standard groups routes by route group so a section's paths are read and extended as a unit. At 12 keys this is still legible — it is well short of the "dozens of keys" threshold — so this is a forward-looking nit, and the important half of the rule (parameterised paths are functions inside the map, so no caller concatenates) is already honoured.
- **Fix:** when the map grows, nest by section (`ROUTES.blog.index` / `ROUTES.blog.post(slug)`); optionally do it now while there are few call sites.

### F21 — `lib/` nests inside kinds

- **What:** `utils/text/`, `utils/svg/`, `utils/storage/`, `utils/writer/`, `hooks/writer/`, `server/utils/ai/` are subfolders inside a kind. The house `code-structure` rule is a kind-first `lib/` that "stays flat inside each kind."
- **Why it matters:** `AGENTS.md` claims conformance with `code-structure` while self-granting these exceptions in the same document, so the two documents disagree about what the standard is. The grouping itself is coherent and each group's files keep the `<concern>.utils.ts` suffix.
- **Fix:** a documentation decision, not a code one — either flatten (`text-case.utils.ts`, `storage-local-store.utils.ts`), or state in `AGENTS.md` that this repo deliberately deviates from the flat-inside-a-kind rule and why.

### F22 — Global MDX components live in the `blog` feature folder

- **What:** `src/mdx-components.tsx:6-8` registers `PostFigure`, `OpenKeyPanelButton`, and `YouTubeEmbed` from `@/components/blog/_shared/` into the MDX map that serves _all_ MDX surfaces — `content/blog/`, `content/issues/`, `content/shop/`, `content/tools/`. Only `content/blog/get-a-gemini-api-key.mdx` uses them today.
- **Why it matters:** they are globally available but feature-owned, so the first shop or tool article that uses `<YouTubeEmbed>` creates a cross-feature dependency on `components/blog/`. The nested `blog/_shared/` folder also isn't in the structure listing in `AGENTS.md`.
- **Fix:** move them to `components/_shared/mdx/` with a barrel, and document the group.

### F23 — Brand values hardcoded in `manifest.ts`

- **What:** `src/app/manifest.ts:23-24` — `theme_color: "#4472e3"`, `background_color: "#ffffff"`; line 14 — `short_name: "The Prod Bug"`. The hex does not appear in `src/styles/tokens.css` (whose comment describes the hub brand as "Blue"), and the short name has no constant in `config/site.ts` alongside `SITE_NAME`/`SITE_TITLE`/`SITE_TAGLINE`.
- **Why it matters:** the brand colour and short name are brand config with a documented owner (`tokens.css`, `config/site.ts`); duplicating them in a route file means a rebrand misses the PWA surface.
- **Fix:** add `SITE_SHORT_NAME` and `BRAND_THEME_COLOR` to `config/site.ts` (sourced from the token value) and import both.

### F24 — `/opengraph-image` concatenated by hand

- **What:** `src/components/blog/post/index.tsx:37`, `src/components/newsletter/issue/index.tsx:42`, `src/components/shop/product/index.tsx:34` each build `` `${SITE_URL}${ROUTES.post(slug)}/opengraph-image` ``.
- **Why it matters:** a framework-owned route suffix pasted into three JSON-LD blocks; if the image route is renamed, three `image` fields 404 silently.
- **Fix:** add `ROUTES.ogImage(path)` (or a `buildOgImageUrl(path)` helper) and call it from all three.

### F25 — `LLM_MODEL` is a non-secret read from the environment

- **What:** `src/lib/config/env.ts:15` validates `LLM_MODEL` (and line 10 `APP_ENV`) from `process.env`. Neither is a secret — leaking the model id harms nothing.
- **Why it matters:** the rule is that non-secrets belong in a committed config module keyed off `APP_ENV`, so the value is reviewable in git and can't differ per environment by accident. `APP_ENV` is legitimately the environment selector itself; `LLM_MODEL` is ordinary config.
- **Fix:** move the model id to a committed `lib/config/ai.ts` keyed off `APP_ENV` (keeping the current `gemini-flash-lite-latest` default and the "-latest alias" comment), and drop it from the env schema and `.env.example`.

## Scorecard

| Category         | Score | Notes                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Naming           | 7/10  | Suffix discipline is real (`Schema`/`Props`/`PageContent`/`UPPER_SNAKE_CASE`, no stray `Type` suffix, no rename-on-import anywhere); undercut by `schema` in `env.ts`, ~20 noun-named helpers, six bare `type Props`, and `URL` shadowing a built-in.                                                                                                                                                             |
| File naming      | 9/10  | `<domain>.<kind>.ts` applied consistently across `constants/ data/ schemas/ types/ utils/ server/**`; `cn.ts` the only bare name outside the sanctioned `config/`; component files PascalCase and matching their export; framework files untouched.                                                                                                                                                               |
| Placement        | 6/10  | Barrels are explicit one-line-per-file with `export *` only in the sanctioned `ui/index.ts`, and the `server-only` boundary holds (no client component reaches past `lib/server/actions`). Costs: nine fat tool layouts, no `config/` barrel with a `server-only` module inside it, AI schemas outside `schemas/`, constants and cross-file types in `components/`, three 350+-line components, one barrel cycle. |
| Duplication      | 5/10  | Four verified duplications with live drift risk: a second article-length constant, a hand-rolled copy of `createToolHistory` (already diverged), the nine-way tool layout boilerplate, and the three `ItemList` builders — plus `PageMain`'s class string and `JsonLdScript`'s escaping re-inlined. The shared layer that would absorb all of it already exists.                                                  |
| Hardcoded values | 6/10  | `ROUTES`/`site.ts` are well built and the content routes use them faithfully; the `(tools)` group and the OG routes don't — nine hardcoded tool paths, 13 site-name literals, ~20 raw hex pairs, and the Sender.net endpoint/IDs inline in an action.                                                                                                                                                             |

## Action items

Phase `production` → tiers are **Fix Now / Next Release / Backlog**.

### Fix Now

| #   | Priority | Task (finding ID)                                                                                  | Effort |
| --- | -------- | -------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Delete `DEFAULT_MAX_CHARS`; default `maxChars` to `MAX_ARTICLE_INPUT_CHARS` (F3)                   | 10 min |
| 2   | P0       | Replace the nine `TOOL_PATH` literals with `getToolBySlug(slug).href` / `ROUTES.tool(slug)` (F1)   | 45 min |
| 3   | P1       | Rewrite `useSeoMetaHistory` on top of `createToolHistory` and restore the missing entry guard (F4) | 30 min |

### Next Release

| #   | Priority | Task (finding ID)                                                                                                                                                                                    | Effort |
| --- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 4   | P1       | Extract `buildToolMetadata` / `buildToolJsonLd` + per-tool copy into `lib/data`; reduce the nine layouts to a `JsonLdScript` wrapper; have the tool shells read `name`/`icon` from the registry (F2) | 1 day  |
| 5   | P1       | Import `SITE_NAME` in the 13 OG route literals (F5)                                                                                                                                                  | 20 min |
| 6   | P1       | Decide `lib/config/`: add the missing barrel and move `env.ts` behind `lib/server/`, or document the deep-path-only exception (F13)                                                                  | 2 h    |
| 7   | P2       | One `buildItemListJsonLd` helper for blog/newsletter/shop (F6)                                                                                                                                       | 30 min |
| 8   | P2       | Source OG subtitles from `*_PAGE_COPY` and extend those records with the OG-only fields (F7)                                                                                                         | 45 min |
| 9   | P2       | Use `PageMain` on the home page (F8)                                                                                                                                                                 | 5 min  |
| 10  | P2       | Rename `schema` → `EnvSchema`; rename the noun-named helpers and vague constants; hoist the single `formatHistoryLabel` (F9, F10)                                                                    | 3 h    |
| 11  | P2       | Move the Sender.net endpoint/version/group IDs into `lib/config/newsletter.ts` (F14)                                                                                                                 | 30 min |
| 12  | P2       | Fix the `create-tool-history` barrel cycle and settle one import rule per direction (F16)                                                                                                            | 45 min |

### Backlog

| #   | Priority | Task (finding ID)                                                                                                 | Effort |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| 13  | P3       | Rename the six bare `Props` types; extract `IconComponent` to `lib/types/` (F11)                                  | 45 min |
| 14  | P3       | Move component-resident domain constants and cross-file types into `lib/constants/` and `lib/types/` (F12)        | 2 h    |
| 15  | P3       | Relocate the AI output schemas to `lib/schemas/` (or document the third location) (F15)                           | 1 h    |
| 16  | P3       | Split `TemplatesPicker`, `SvgToJsxTool`, `SeoMetaTool`; extract the SVG helpers and a `useSeoMetaTool` hook (F17) | 1 day  |
| 17  | P3       | Move `SeoMetaHistory` and the standalone option shapes into `types/` (F18)                                        | 45 min |
| 18  | P3       | Introduce `OG_PALETTES` and drop the raw hex from the OG routes (F19)                                             | 1 h    |
| 19  | P4       | Group `ROUTES` by section (F20)                                                                                   | 1 h    |
| 20  | P4       | Reconcile the nested-`lib/` deviation between `AGENTS.md` and `code-structure` (F21)                              | 30 min |
| 21  | P4       | Move the global MDX components to `components/_shared/mdx/` (F22)                                                 | 30 min |
| 22  | P4       | Add `SITE_SHORT_NAME` / `BRAND_THEME_COLOR` and use them in `manifest.ts` (F23)                                   | 20 min |
| 23  | P4       | Add a route helper for the `/opengraph-image` suffix (F24)                                                        | 20 min |
| 24  | P4       | Move `LLM_MODEL` out of env into a committed AI config module (F25)                                               | 30 min |

## Resolved since last audit

| ID  | Issue                       | How it was resolved |
| --- | --------------------------- | ------------------- |
| —   | First run — no prior report | —                   |
