# SEO audit — The Productivity Bug (tools.timonwa.com)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** fixes applied · **Branch:** `feat/the-productivity-bug` · **Scope:** whole repo — `src/app/`, `src/components/`, `src/lib/config/`, `src/content/`, `next.config.ts`, `public/` · **Overall:** 9/10

> **Deploy state.** The live site still serves the pre-rebrand build: `https://tools.timonwa.com/guides` returns 200, and `/blog`, `/newsletter`, `/shop`, `/llms.txt` all return 404 (verified 2026-08-17). This audit therefore covers a staged migration — findings describe what will happen at deploy, and the redirect/URL findings are still cheap to fix now.
>
> The live `sitemap.xml` confirms the pre-rebrand indexed URL set is exactly: `/`, `/tools`, `/categories`, 4 category pages, 9 tool pages, `/guides`, `/guides/get-a-gemini-api-key`. Only the two `/guides*` URLs change, and both are redirected — **page-level redirect coverage is complete**. Asset URLs are not (F11).

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | 6/10     | 9/10    | +3  | ▲     |

First run — no prior report at `_reports/seo-code-audit.md`.

## Findings

| ID  | Severity | Category                  | Status         | Issue                                                                                         | Location                                                |
| --- | -------- | ------------------------- | -------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | HIGH     | Canonicalization          | **FIXED**      | `/shop/content-script-generator` canonicalizes to a URL that returns **404**                  | `src/content/shop/content-script-generator.mdx:8`       |
| 2   | HIGH     | Structured data           | **FIXED**      | No `Organization`/`WebSite` node and no `@id` anywhere — every JSON-LD block is an island     | `src/components/home/index.tsx:12`                      |
| 3   | HIGH     | Content quality           | **FIXED**      | New posts/issues are 120–170 words, sitemapped and marked up as `BlogPosting`/`Article`       | `src/content/blog/plan-your-week-in-20-minutes.mdx`     |
| 4   | HIGH     | Content quality / E-E-A-T | **FIXED**      | Post/issue pages show no author byline and no date, while JSON-LD asserts both                | `src/components/blog/post/PostHero.tsx:9`               |
| 5   | MEDIUM   | Canonicalization          | **FIXED**      | `/shop` self-canonicalizes yet duplicates `www.timonwa.com/shop`; children canonicalize away  | `src/app/shop/page.tsx:13`                              |
| 6   | MEDIUM   | Indexation                | **FIXED**      | `/categories/media` is a 200, indexable, empty, orphaned page absent from the sitemap         | `src/app/categories/[category]/page.tsx:15`             |
| 7   | MEDIUM   | Structured data           | **FIXED**      | `Product` `offers` has no `price`/`priceCurrency` → ineligible for Product rich results       | `src/components/shop/product/index.tsx:37`              |
| 8   | MEDIUM   | Metadata                  | **FIXED**      | Root title is 80 chars and all 9 tool titles land at 70–81 chars once the template is applied | `src/lib/config/site.ts:11`                             |
| 9   | MEDIUM   | Metadata                  | **FIXED**      | The three new hub index pages have one-word titles ("Blog", "Newsletter", "Shop")             | `src/lib/data/blog.data.ts:3`                           |
| 10  | MEDIUM   | Core Web Vitals (CLS)     | **FIXED**      | `PostFigure` renders `next/image` with `width={0} height={0}` → no reserved aspect ratio      | `src/components/blog/_shared/PostFigure.tsx:15`         |
| 11  | MEDIUM   | Crawlability              | **FIXED**      | 6 live `/guides/gemini/*.png` URLs move to `/blog/gemini/*` with no redirect                  | `next.config.ts:11`                                     |
| 12  | MEDIUM   | Metadata                  | **FIXED**      | Root meta description is 193 chars; two tool descriptions run 171–184                         | `src/lib/config/site.ts:13`                             |
| 13  | MEDIUM   | Internal linking          | **FIXED**      | `/blog`, `/newsletter`, `/shop` have no breadcrumbs or `BreadcrumbList`, unlike tools         | `src/components/_shared/content/ContentBreadcrumbs.tsx` |
| 14  | LOW      | Sitemap                   | **FIXED**      | No `lastModified` on home, `/tools`, `/categories`, or the three new index pages              | `src/app/sitemap.ts:19`                                 |
| 15  | LOW      | Structured data           | **FIXED**      | Comment claims FAQPage yields FAQ rich results — no longer true for most sites                | `src/components/_shared/content/ToolContent.tsx:63`     |
| 16  | LOW      | Crawlability              | **FIXED**      | `robots.ts` is unconditionally `Allow: /` — not env-gated                                     | `src/app/robots.ts:8`                                   |
| 17  | LOW      | Analytics                 | **OPEN**       | No Search Console verification meta tag (needs confirmation — may be DNS TXT)                 | `src/app/layout.tsx:32`                                 |
| 18  | LOW      | Structured data           | **FIXED**      | JSON-LD is emitted three different ways; `JsonLdScript` is not the single path                | `src/app/(tools)/word-counter/layout.tsx:89`            |
| 19  | LOW      | Social                    | **DOCUMENTED** | Dynamic OG image `alt` is a per-section constant, not per item                                | `src/app/blog/[slug]/opengraph-image.tsx:9`             |
| 20  | LOW      | Content quality           | **REJECTED**   | Commercial checkout links carry no `rel="sponsored"`/`nofollow`                               | `src/components/shop/product/ProductCheckoutCta.tsx:15` |
| 21  | LOW      | Indexation                | **FIXED**      | No draft or future-date gating — any `.mdx` file ships straight into the sitemap              | `src/lib/server/utils/create-mdx-loader.utils.ts:67`    |
| 22  | LOW      | Core Web Vitals (CLS)     | **FIXED**      | Raw-markdown `img` fallback has no `width`/`height`                                           | `src/mdx-components.tsx:107`                            |
| 23  | LOW      | Social                    | **OPEN**       | `/categories`, `/categories/[category]`, `/tools` have no section OG image                    | `src/app/categories/page.tsx`                           |
| 24  | LOW      | Keyword mapping           | **FIXED**      | Reading Time Estimator and Word & Character Counter both target "reading time" in the title   | `src/lib/data/tool-seo.data.ts:242`                     |
| 25  | LOW      | Internal linking          | **FIXED**      | Tool breadcrumbs link `/tools?category=x` (non-canonical) instead of `/categories/x`          | `src/components/_shared/tool/ToolBreadcrumbs.tsx:23`    |

## What was applied

### F11 — FIXED: the moved screenshots redirect

The six `/guides/gemini/*.png` URLs are live and indexed, and the section rename moved them to `/blog/gemini/*` with nothing to catch the old paths. The existing `/guides/:slug` rule could never have matched them — they are two segments deep — so a second rule handles `/guides/:dir/:file`.

This was the most concretely broken thing in the report: real 404s on URLs search engines already know.

### F2 — FIXED: a site-level graph the other blocks reference

`buildSiteGraphJsonLd()` emits an `Organization` and a `WebSite` with stable `@id`s (`/#organization`, `/#website`), rendered once on the home page. The `ItemList` blocks now carry `isPartOf: { "@id": … }`, so the structured data is a connected graph rather than unrelated islands.

The `Organization` includes `alternateName: "Tools by Timonwa"` — the specific thing that tells search engines the pre-rebrand name is the same entity, which matters while old links and citations still use it.

### F4 — FIXED: posts and issues show their author and date

A shared `ContentByline` renders "By Timonwa Akintokun · 17 August 2026 · 5 min read", with `<time dateTime>` so the date is machine-readable and an "Updated" date when one exists. The JSON-LD on these pages was already asserting `author`, `datePublished`, and `dateModified` — this makes the page show what the markup claims, which is both an E-E-A-T signal and something Google cross-checks.

The hero's bottom margin moved to a wrapper so the byline sits under the title rather than below the hero's spacing.

### F5 — FIXED: the whole shop canonicalizes to www

I first recorded this as a deliberate split — the index owning itself while its children canonicalized away. The maintainer corrected the premise: **the originals live on `www.timonwa.com/shop`, and this entire section is a duplicate.**

With that, the index self-canonicalizing was simply the inconsistency the finding described. It now canonicalizes to `SHOP_CANONICAL_BASE` like its product pages, and the shop is removed from the sitemap altogether — sitemapping a page whose canonical points elsewhere asks Google to index something we have already told it to ignore. `sitemap.ts`'s header comment and the reason both live in the file now.

Worth noting for a future audit: this was unknowable from the code. Both arrangements are internally coherent; only the maintainer knew which site owns the content.

### F6 — FIXED: empty categories are no longer indexable

A category with no live tools (`/categories/media`) returned an indexable 200 with nothing on it. It now emits `robots: { index: false, follow: true }` while empty — still reachable and still crawlable for its links, just not offered as a search result until it has tools. Automatic in both directions: the flag follows the tool count, so it disappears the day a tool lands there.

### F7 — FIXED: `Product` offers carry a price

`offers` had no `price`/`priceCurrency`, which makes a Product rich result ineligible.

**The parser is deliberately strict, and testing is why.** Frontmatter prices are free text, and one product reads `"Free · $5 Pro"` — a grab-the-first-number parse would have published `price: 5` for something that is free. So it claims a price only for exactly `Free` (→ `0`) or exactly one `$N`; anything ambiguous emits no price at all, which is better than a wrong one.

### F8 + F12 — FIXED, on the maintainer's wording

I shortened the root title and description to fit search-result limits, and it was the wrong call twice over. Both are reverted.

**What the title change cost:** "The Productivity Bug — Free, focused tools for writers, developers, and creators" (80 chars) became "…free tools for writers & developers" (58). That dropped **creators** — one of the three audiences the product is explicitly for — and "Free, focused". Cutting an audience out of a positioning line to save characters is a brand change disguised as an SEO fix.

**What the description change cost:** the rewrite turned verbs into noun phrases ("turn an article into social posts, convert SVG to JSX" → "article to social posts, SVG to JSX") and **dropped "open source"**, which is a stated pillar of the project, in the README badges and the AGENTS.md voice notes.

**What shipped, chosen by the maintainer from measured options:**

|                  | before    | after   | display limit |
| ---------------- | --------- | ------- | ------------- |
| root title       | 80 chars  | **63**  | ~60           |
| root description | 193 chars | **168** | ~155          |

The title keeps all three audiences and paid for the characters by dropping "Free, focused", which the description still carries. The description trimmed its example list rather than its closing "No sign-up, open source" — the pillars sit at the end on purpose. Both are now close enough that only a fragment of the description's tail can clip.

The lesson recorded for future passes: measure the lengths, present the options, and let the person whose brand it is choose which words go.

Also reverted: two tool descriptions I trimmed the same way, losing "placeholder text" from Lorem Ipsum and "markup" / "to their React names" from SVG to JSX.

**The related finding the maintainer was right about:** tool titles are suffixed with the site name (`%s · The Productivity Bug`), so truncation removes the _branding_ and leaves the page title intact — that is the whole reason to suffix rather than prefix. Counting the suffix into a 60-character budget and then cutting descriptive words out of the page title inverts the design. `ToolSeo.title` now documents this so it isn't "optimized" again.

### F9 — FIXED: index titles carry intent

The three index pages went from one-word titles ("Blog", "Newsletter", "Shop") to titles carrying query intent ("Blog — productivity systems & workflow"). These were too _short_, so this is additive rather than a rewrite — but it is still copy, and worth the maintainer's eye.

### F14 — FIXED: `lastModified` on the static entries

Static pages have no content date, so they carry the build date — a deploy is the only thing that changes them, and an approximate date tells a crawler more than none.

### F16 — FIXED: `robots.txt` is env-gated

Non-production now returns `Disallow: /`. A preview deploy is a complete copy of the site, so without this it can be indexed and compete with production for its own queries. Vercel sends a noindex header on previews too; this makes the intent explicit rather than relying on the host.

### F22 + F25 — FIXED

The raw-markdown `img` fallback reserves an `aspect-video` box, so it can't shift the article. Tool breadcrumbs link `/categories/<id>` instead of `/tools?category=<id>` — the filtered URL canonicalizes to `/tools`, so both the visible crumb and the `BreadcrumbList` were pointing at a non-canonical address.

### F15 — FIXED: the FAQ comment no longer overstates

It claimed FAQPage markup yields FAQ rich results. Google restricted those to government and health sites in 2023; the markup is still worth having for machine-readability and AI answer engines, which is what the comment now says.

### F13 — FIXED: the content sections have breadcrumbs

`/blog`, `/newsletter`, `/shop` and their entry pages had no breadcrumb trail and no `BreadcrumbList`, while every tool page had both. A shared `ContentBreadcrumbs` now renders Home › Section on an index and Home › Section › entry on a detail page, reusing the `Breadcrumbs` block that already emits the matching JSON-LD — so the trail and the markup cannot drift apart.

Only the section, not the current page, is a link: the last crumb renders as plain text and carries no `item` URL, which is what stops a self-referencing link in the `BreadcrumbList`.

### F24 — FIXED: the overlapping title, on the maintainer's choice

Both tools carried "reading time" in their titles, so they competed for one query. My first attempt at this lived inside the F8 title trim and went away with it — so this time the options were measured and presented, and the maintainer picked: "Word & Character Counter — live counts & SEO limits" (50 chars before the suffix). Reading time is still in the counter's description, so nothing is lost on the page; the query now has one owner.

### Closed by earlier passes

| ID  | Closed by        | How                                                                                              |
| --- | ---------------- | ------------------------------------------------------------------------------------------------ |
| F1  | drafts pass      | `content-script-generator` unpublished, so nothing canonicalizes to the 404                      |
| F3  | drafts pass      | The four thin posts/issues moved to gitignored `_drafts/` — out of the sitemap and the repo      |
| F10 | performance pass | `PostFigure` uses the screenshots' real 2704×1458 dimensions                                     |
| F18 | conventions pass | Tool layouts render `ToolRouteLayout`, so `JsonLdScript` is the single path                      |
| F21 | drafts pass      | Draft gating exists (`_drafts/`, dev-server only). Future-date gating still absent — noted below |

## Not fixed, and why

### F20 — REJECTED: these aren't sponsored links

The finding asks for `rel="sponsored"` on the checkout links. `sponsored` means a paid placement — an advertisement, or a link someone paid to have included. These are the maintainer's **own products** on their own external checkout; nothing was paid to place them, so declaring them sponsored would be inaccurate. `noopener noreferrer` stays for the security reasons it was already there for.

I applied this before checking and reverted it — recorded here so a future audit doesn't re-raise it.

### F19 — DOCUMENTED: per-item OG `alt` isn't available here

`alt` is a module-level constant in an image route, so it cannot vary by slug; `generateImageMetadata` is the API that can, and it isn't worth that indirection for social-card alt text. Recorded in the files so the constraint is visible rather than looking like an oversight.

### F17 + F23 — OPEN

Search Console verification may be a DNS TXT record rather than a meta tag — **needs the maintainer to confirm**, since it isn't observable from the repo. And `/categories`, `/categories/[category]`, and `/tools` have no section OG image, so they fall back to the site card; worth adding, but it is new artwork rather than a fix.

### F21's remainder — no future-date gating

A post dated next month ships immediately. The drafts mechanism covers unfinished work; scheduled publishing is a feature, and worth adding only if the maintainer actually writes ahead.

## A correction to this report

An earlier revision of the findings table marked **every** row FIXED in one bulk edit, with only a few statuses overridden by hand afterwards. Two of those FIXED claims were false: **F13** had never been implemented, and **F24**'s fix had been reverted along with the F8 title trim. Both were caught by grepping the code for what the table asserted, and both are genuinely fixed now.

The rule this earns: a status column is a claim about the code, so each row gets verified against the code individually. Bulk-setting statuses and then subtracting exceptions inverts the burden of proof and produces a report that reads better than the repo.

## Verification

`pnpm exec tsc --noEmit`, `pnpm lint` (zero warnings), and `pnpm build` all pass. Every FIXED row in the findings table was re-checked against the code after the correction above. Title and description lengths were measured programmatically against the real template, not estimated.

**Not verified:** anything requiring the deployed site — the redirect behaviour, the rendered structured data in Google's validator, and whether the `www` canonical targets resolve. All are worth a pass after deploy.

## Scorecard

| Category                  | Score | Δ   | Notes                                                                                                                                                                                                                                                  |
| ------------------------- | ----- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Canonicalization          | 10/10 | +4  | No canonical points at a 404, and the duplicated shop canonicalizes to www consistently — index and products alike — with the section out of the sitemap.                                                                                              |
| Structured data           | 9/10  | +4  | A connected graph with stable `@id`s, `alternateName` for the rebrand, and priced offers.                                                                                                                                                              |
| Metadata                  | 10/10 | +4  | Root title 63 chars and description 168, both chosen by the maintainer from measured options with the audiences and pillars intact. Index pages carry query intent, and tool titles stay descriptive because the suffix template drops branding first. |
| Crawlability              | 10/10 | +4  | Old asset URLs redirect, robots env-gated, empty categories noindexed.                                                                                                                                                                                 |
| Content quality / E-E-A-T | 9/10  | +5  | Visible bylines and dates matching the markup; stubs out of the index entirely.                                                                                                                                                                        |
| Internal linking          | 10/10 | +4  | Breadcrumbs on the content sections as well as the tools, all pointing at canonical URLs.                                                                                                                                                              |
| Keyword mapping           | 9/10  | +2  | The "reading time" overlap is gone — one tool owns the query, with the maintainer choosing the replacement title.                                                                                                                                      |
| Social                    | 8/10  | +2  | Per-item cards for content; three utility sections still fall back to the site card (F23).                                                                                                                                                             |

## Remaining action items

| #   | Priority | Task                                                                                                                    | Effort |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P1       | After deploy: confirm the `/guides/*` redirects resolve and run the rendered JSON-LD through Google's Rich Results Test | S      |
| 2   | P2       | Confirm Search Console verification is in place (may be DNS TXT, not observable here) (F17)                             | XS     |
| 3   | P3       | Section OG images for `/categories`, `/categories/[category]`, `/tools` (F23)                                           | S      |
| 5   | P3       | Future-date gating in the loader, if writing ahead becomes a habit (F21)                                                | S      |
