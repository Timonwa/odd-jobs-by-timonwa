# SEO audit — The Productivity Bug (tools.timonwa.com)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `feat/the-productivity-bug` · **Scope:** whole repo — `src/app/`, `src/components/`, `src/lib/config/`, `src/content/`, `next.config.ts`, `public/` · **Overall:** 6/10

> **Deploy state.** The live site still serves the pre-rebrand build: `https://tools.timonwa.com/guides` returns 200, and `/blog`, `/newsletter`, `/shop`, `/llms.txt` all return 404 (verified 2026-08-17). This audit therefore covers a staged migration — findings describe what will happen at deploy, and the redirect/URL findings are still cheap to fix now.
>
> The live `sitemap.xml` confirms the pre-rebrand indexed URL set is exactly: `/`, `/tools`, `/categories`, 4 category pages, 9 tool pages, `/guides`, `/guides/get-a-gemini-api-key`. Only the two `/guides*` URLs change, and both are redirected — **page-level redirect coverage is complete**. Asset URLs are not (F11).

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | N/A      | 6/10    | N/A | N/A   |

First run — no prior report at `_reports/seo-code-audit.md`.

## Findings

| ID  | Severity | Category                  | Status | Issue                                                                                         | Location                                                |
| --- | -------- | ------------------------- | ------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | HIGH     | Canonicalization          | NEW    | `/shop/content-script-generator` canonicalizes to a URL that returns **404**                  | `src/content/shop/content-script-generator.mdx:8`       |
| 2   | HIGH     | Structured data           | NEW    | No `Organization`/`WebSite` node and no `@id` anywhere — every JSON-LD block is an island     | `src/components/home/index.tsx:12`                      |
| 3   | HIGH     | Content quality           | NEW    | New posts/issues are 120–170 words, sitemapped and marked up as `BlogPosting`/`Article`       | `src/content/blog/plan-your-week-in-20-minutes.mdx`     |
| 4   | HIGH     | Content quality / E-E-A-T | NEW    | Post/issue pages show no author byline and no date, while JSON-LD asserts both                | `src/components/blog/post/PostHero.tsx:9`               |
| 5   | MEDIUM   | Canonicalization          | NEW    | `/shop` self-canonicalizes yet duplicates `www.timonwa.com/shop`; children canonicalize away  | `src/app/shop/page.tsx:13`                              |
| 6   | MEDIUM   | Indexation                | NEW    | `/categories/media` is a 200, indexable, empty, orphaned page absent from the sitemap         | `src/app/categories/[category]/page.tsx:15`             |
| 7   | MEDIUM   | Structured data           | NEW    | `Product` `offers` has no `price`/`priceCurrency` → ineligible for Product rich results       | `src/components/shop/product/index.tsx:37`              |
| 8   | MEDIUM   | Metadata                  | NEW    | Root title is 80 chars and all 9 tool titles land at 70–81 chars once the template is applied | `src/lib/config/site.ts:11`                             |
| 9   | MEDIUM   | Metadata                  | NEW    | The three new hub index pages have one-word titles ("Blog", "Newsletter", "Shop")             | `src/lib/data/blog.data.ts:3`                           |
| 10  | MEDIUM   | Core Web Vitals (CLS)     | NEW    | `PostFigure` renders `next/image` with `width={0} height={0}` → no reserved aspect ratio      | `src/components/blog/_shared/PostFigure.tsx:15`         |
| 11  | MEDIUM   | Crawlability              | NEW    | 6 live `/guides/gemini/*.png` URLs move to `/blog/gemini/*` with no redirect                  | `next.config.ts:11`                                     |
| 12  | MEDIUM   | Metadata                  | NEW    | Root meta description is 193 chars; two tool descriptions run 171–184                         | `src/lib/config/site.ts:13`                             |
| 13  | MEDIUM   | Internal linking          | NEW    | `/blog`, `/newsletter`, `/shop` have no breadcrumbs or `BreadcrumbList`, unlike tools         | `src/components/blog/post/index.tsx:44`                 |
| 14  | LOW      | Sitemap                   | NEW    | No `lastModified` on home, `/tools`, `/categories`, or the three new index pages              | `src/app/sitemap.ts:19`                                 |
| 15  | LOW      | Structured data           | NEW    | Comment claims FAQPage yields FAQ rich results — no longer true for most sites                | `src/components/_shared/content/ToolContent.tsx:63`     |
| 16  | LOW      | Crawlability              | NEW    | `robots.ts` is unconditionally `Allow: /` — not env-gated                                     | `src/app/robots.ts:8`                                   |
| 17  | LOW      | Analytics                 | NEW    | No Search Console verification meta tag (needs confirmation — may be DNS TXT)                 | `src/app/layout.tsx:32`                                 |
| 18  | LOW      | Structured data           | NEW    | JSON-LD is emitted three different ways; `JsonLdScript` is not the single path                | `src/app/(tools)/word-counter/layout.tsx:89`            |
| 19  | LOW      | Social                    | NEW    | Dynamic OG image `alt` is a per-section constant, not per item                                | `src/app/blog/[slug]/opengraph-image.tsx:9`             |
| 20  | LOW      | Content quality           | NEW    | Commercial checkout links carry no `rel="sponsored"`/`nofollow`                               | `src/components/shop/product/ProductCheckoutCta.tsx:15` |
| 21  | LOW      | Indexation                | NEW    | No draft or future-date gating — any `.mdx` file ships straight into the sitemap              | `src/lib/server/utils/create-mdx-loader.utils.ts:67`    |
| 22  | LOW      | Core Web Vitals (CLS)     | NEW    | Raw-markdown `img` fallback has no `width`/`height`                                           | `src/mdx-components.tsx:107`                            |
| 23  | LOW      | Social                    | NEW    | `/categories`, `/categories/[category]`, `/tools` have no section OG image                    | `src/app/categories/page.tsx`                           |
| 24  | LOW      | Keyword mapping           | NEW    | Reading Time Estimator and Word & Character Counter both target "reading time" in the title   | `src/app/(tools)/word-counter/layout.tsx:15`            |
| 25  | LOW      | Internal linking          | NEW    | Tool breadcrumbs link `/tools?category=x` (non-canonical) instead of `/categories/x`          | `src/components/_shared/tool/ToolBreadcrumbs.tsx:23`    |

### F1 — Shop product canonical points at a 404

- **What:** `ProductFrontmatterSchema` forces every product's `canonicalUrl` to start with `SHOP_CANONICAL_BASE` (`https://www.timonwa.com/shop/`), and `src/app/shop/[slug]/page.tsx:32` emits it as `alternates.canonical`. I checked all six targets over the network: five return 200, but `https://www.timonwa.com/shop/content-script-generator` returns **HTTP/2 404** (confirmed twice, with and without redirect following). Fetching `www.timonwa.com/shop` confirms why — that index lists five products and Content Script Generator is not among them. The same dead URL is also emitted as the `Product` JSON-LD `url` (`src/components/shop/product/index.tsx:35`).
- **Why it matters:** A cross-domain canonical pointing at a 404 is the worst of both worlds. The local page tells Google "don't index me, index that instead," the target doesn't exist, and the page is also deliberately excluded from `sitemap.ts`. The result is that the only page anywhere for a **$10 paid product** is signalled as non-canonical with no valid replacement — Google will either drop it or ignore the canonical unpredictably. Zod validates the URL's _prefix_, so the schema gives false confidence that the target is real.
- **Fix:** Either publish `www.timonwa.com/shop/content-script-generator`, or make `canonicalUrl` optional and have `src/app/shop/[slug]/page.tsx` fall back to a self-referencing canonical (`ROUTES.product(slug)`) plus a sitemap entry when no off-site listing exists. Long term, add a build-time check that fetches each `canonicalUrl` and fails on a non-200 — the same "fail the build loudly" principle the frontmatter schema already applies.

### F2 — No sitewide entity graph: no Organization, no WebSite, no `@id`

- **What:** `grep '"@id"'` across `src/` returns nothing, and so do `Organization`, `WebSite`, and `isPartOf`. The home page (`src/app/page.tsx` → `src/components/home/index.tsx`) renders **zero** structured data. Every JSON-LD block in the repo is a standalone node: `WebApplication` in the nine tool layouts, `FAQPage` in `ToolContent`, `BreadcrumbList` in `Breadcrumbs`, `ItemList` on the three index pages, `BlogPosting`/`Article`/`Product` on detail pages. None reference each other or a publisher entity.
- **Why it matters:** This is the single highest-leverage gap given the rebrand. Google has years of signal associating this domain with "Tools by Timonwa"; an `Organization` (or `Person` publisher) node carrying `name: "The Productivity Bug"`, `alternateName: "Tools by Timonwa"`, `url`, `logo`, and `sameAs: CREATOR_SAME_AS` — all of which already exist as constants in `src/lib/config/site.ts` — is the explicit mechanism for teaching a search engine that an entity was renamed. A `WebSite` node also unlocks sitelinks-searchbox eligibility and gives the `BlogPosting.publisher` on every post a real `@id` to point at instead of an inline duplicate.
- **Fix:** Add one graph emitted from the root layout via the existing `JsonLdScript`: `@graph` with an `Organization` (`@id: ${SITE_URL}/#organization`, `alternateName` for the old brand) and a `WebSite` (`@id: ${SITE_URL}/#website`, `publisher: { "@id": ".../#organization" }`). Then replace the inline `publisher`/`author` objects in `src/components/blog/post/index.tsx:39-40` and `src/components/newsletter/issue/index.tsx:44-45` with `@id` references, and add `isPartOf: { "@id": ".../#website" }` to the page-level nodes.

### F3 — The new blog and newsletter sections launch with thin content

- **What:** Body word counts (frontmatter stripped): `plan-your-week-in-20-minutes.mdx` 164, `one-article-a-week-of-content.mdx` 170, `three-tools-for-faster-publishing.mdx` 120, `welcome-to-the-productivity-bug.mdx` 138. Only the migrated `get-a-gemini-api-key.mdx` (486) has substance. All of them are emitted into `sitemap.ts` (lines 47–72) and marked up as `BlogPosting`/`Article`.
- **Why it matters:** For a blog/content site, thin pages are the characteristic failure mode. Four of five new content URLs are effectively stubs asking to rank for competitive generic queries ("weekly planning", "content repurposing", "time management"). Submitting them in the sitemap on day one invites a low quality assessment on a brand-new section, which is the hardest kind of first impression to reverse — and it dilutes the domain-level signal the tool pages have already earned.
- **Fix:** Either expand each to a genuinely useful depth (the Gemini guide is the right model — concrete steps, screenshots, specifics) before deploy, or gate them behind a `draft: true` frontmatter flag (see F21) so the loader keeps them out of `getAll()`, the sitemap, and `generateStaticParams` until they're ready. Ship `/blog` with one strong post rather than three, and `/newsletter` as an archive that grows.

### F4 — Post and issue pages assert authorship in JSON-LD but show none on the page

- **What:** `src/components/blog/post/index.tsx:34-40` emits `datePublished`, `dateModified`, `author`, and `publisher`; `src/components/newsletter/issue/index.tsx:39-45` does the same. But the rendered page is `PostHero` (eyebrow pill + `<h1>` + description) → `<article>` → related grid → newsletter → a single "Browse all posts" link. `grep '<time\|dateTime'` across `src/components` matches only `IssueGrid.tsx:25` (the newsletter _index_ card), never a detail page. No byline, no publish date, no updated date, no author bio, anywhere on a post or issue page.
- **Why it matters:** Two problems at once. (a) It breaks the structured-data rule that you mark up only what's on the page — Google's guidance is explicit that `datePublished`/`author` should be visible to users, and a mismatch risks the markup being ignored. (b) It's a direct E-E-A-T gap on the exact page type Google weighs authorship hardest, and the site has an obvious author to name: `CREATOR_NAME`, `CREATOR_URL`, and `CREATOR_SAME_AS` are already imported into the very same file. Freshness also can't be judged by readers or by AI crawlers looking for a date to cite.
- **Fix:** Add a byline row to `PostHero`/`IssueHero`: author name linking to `CREATOR_URL`, a `<time dateTime={post.publishedAt}>` published date, an "Updated" `<time>` when `updatedAt` is set, and the existing `readingMinutes`. There is no on-site About or Contact page either (`FOOTER_META_LINKS` and `FOOTER_LEGAL_LINKS` all point off-domain) — an on-site author page would anchor the `Person` node from F2.

### F5 — The shop's canonicalization strategy is coherent for children but not for the index

- **What:** Product detail pages canonicalize off-site and are excluded from `sitemap.ts` (comment at lines 73–74) — deliberate and internally consistent. The index is not. `src/app/shop/page.tsx:13` gives `/shop` a self-referencing canonical and `sitemap.ts:75-79` submits it, but I fetched `www.timonwa.com/shop` and it lists the same five products with the same positioning. Three further inconsistencies: `src/components/shop/index.tsx:20` builds `ItemList` from local `/shop/<slug>` URLs (non-canonical); `src/app/shop/[slug]/page.tsx:35` sets `openGraph.url` to the local URL while `alternates.canonical` points off-site; and `HubFooter.tsx:58-67` puts four product links in a **sitewide** footer column, so every page on the domain links to four URLs that disclaim themselves.
- **Why it matters:** Google is asked to consolidate six children onto `www` while simultaneously being offered a near-duplicate index on `tools` — the same duplicate-content decision the child canonicals were added to avoid, just moved up a level. Meanwhile every internal link in the footer flows crawl budget and PageRank into pages that redirect their own equity off-domain, and the `ItemList` URLs don't match the canonicals they describe.
- **Fix:** Pick one owner for the shop. If `www` owns it: canonicalize `/shop` to `https://www.timonwa.com/shop`, drop it from the sitemap, and point the footer's Shop column at the `www` listing. If `tools` owns it (which the richer local product bodies — 285–532 words — and the OG images suggest): drop `SHOP_CANONICAL_BASE`, use self-referencing canonicals, and add the products back to the sitemap. Either way, make `ItemList` URLs and `openGraph.url` agree with whatever canonical you emit.

### F6 — `/categories/media` is an indexable, empty, orphaned page

- **What:** `generateStaticParams` at `src/app/categories/[category]/page.tsx:15` prerenders **all** of `TOOL_CATEGORIES`, including `media`, which has no live tools. `CategoryDetail.tsx:44-51` renders an `EmptyState` ("No media tools yet"). `CategoryCard.tsx:18` correctly links empty categories to `/categories` instead, so nothing links to it. `sitemap.ts:29-31` filters it out. But `generateMetadata` still emits a self-referencing canonical, the root layout's `robots: { index: true, follow: true }` still applies, and the page returns 200 — I confirmed `https://tools.timonwa.com/categories/media` responds **200** on the live site today.
- **Why it matters:** A 200 page whose only content is "nothing here yet" is the textbook soft-404 that Search Console flags. Because it's unlinked and unsitemapped, its only value is negative: it can still be discovered (patterned URLs, external links, the previous crawl) and counted as a low-quality page. The existing code already knows the category is empty in three separate places, so the signal is available.
- **Fix:** Have `generateStaticParams` filter to categories with `getToolsInCategory(id).length > 0` and let the rest hit `notFound()`, or keep the page for UX and add `robots: { index: false, follow: true }` in `generateMetadata` when the category is empty. The sitemap filter already encodes the right predicate — reuse it.

### F7 — Product JSON-LD can't produce a rich result

- **What:** `src/components/shop/product/index.tsx:37-41` emits `offers: { "@type": "Offer", url, availability }` — no `price`, no `priceCurrency`. The only price data is `ProductFrontmatterSchema`'s optional display string, which holds values like `"Free"`, `"$10"`, and `"Free · $5 Pro"` (`goals-planner.mdx`) — unparseable as a number.
- **Why it matters:** Google's Product structured-data requirements make `offers.price` and `offers.priceCurrency` required for a merchant-listing or product-snippet rich result. As written the markup is syntactically valid but ineligible, so the effort produces no SERP feature — and the `Product` node is on a page that canonicalizes off-site anyway (F1/F5), so the markup is attributed to a URL that in one case doesn't exist.
- **Fix:** Split the frontmatter into machine-readable `price: number` (0 for free) plus `priceCurrency: "USD"`, keeping the current string as `priceLabel` for display. Use `offers.priceSpecification` or an `AggregateOffer` with `lowPrice`/`highPrice` for the tiered products. Emit the node on whichever URL you settle on as canonical in F5.

### F8 — Titles overrun the SERP width sitewide

- **What:** Measured with the root template `%s · The Productivity Bug` (24 chars) applied: root/home 80; `reading-time` 81; `svg-to-jsx` 77; `lorem-ipsum` 76; `slug-generator` 75; `article-to-seo-meta` 74; `article-to-social-posts` 72; `hash-generator` 72; `word-counter` 71; `case-converter` 70; `/categories` 64. Every tool page and the home page sit well past the ~50–60 char guidance.
- **Why it matters:** Google truncates around 60 characters, so the trailing 10–20 characters — which on a tool page is where the differentiator lives ("reading time & limits", "in spec", "a post for each network") — is cut. Ironically the site ships a _tool_ for sizing SEO titles. Note the rebrand made this worse: "The Productivity Bug" is longer than the old suffix, so it eats more of every title.
- **Fix:** Two moves. Shorten `SITE_TITLE` for the home page to something like "The Productivity Bug — free tools for writers and creators" (~58). And either shorten the `%s · {site}` template to a bare `%s` for tool pages, or trim each `TOOL_TITLE` so title + suffix lands under 60 (e.g. "Word & Character Counter" + suffix = 47).

### F9 — The three new hub index pages have one-word titles

- **What:** `BLOG_PAGE_COPY.title = "Blog"`, `NEWSLETTER_PAGE_COPY.title = "Newsletter"`, `SHOP_PAGE_COPY.title = "Shop"` (`src/lib/data/*.data.ts`), used directly as `metadata.title` in all three `page.tsx` files. Resolved: "Blog · The Productivity Bug" (27 chars), "Shop · The Productivity Bug" (27).
- **Why it matters:** These are the three highest-value new URLs on the domain and their titles carry no query intent at all — the exact inverse of F8's overrun. Compare `/tools`, which does this right: "All tools — the full directory". The `<h1>` on each page is already better than the title ("Getting things done, made simpler", "Products that get things done"), and so is the OG-image copy — the metadata is the only surface that got left generic.
- **Fix:** Give each a descriptive, intent-bearing title in the same data file, e.g. "Blog — productivity systems and workflows", "Newsletter — productivity notes in your inbox", "Shop — Notion templates and digital products". Keep the hero `<h1>` distinct from the title tag as it is now; only the metadata needs the keyword.

### F10 — `PostFigure` reserves no space for its image

- **What:** `src/components/blog/_shared/PostFigure.tsx:15-22` renders `<Image src={src} width={0} height={0} sizes="…" className="h-auto w-full" />`. `width={0} height={0}` gives the `<img>` no intrinsic aspect ratio, and `h-auto` means CSS supplies none either, so the element occupies zero height until the bitmap loads and then jumps to full height. The Gemini guide has **six** such figures interleaved with the numbered steps.
- **Why it matters:** Six unreserved images stacked down the longest post on the site is a direct CLS hit on the page most likely to be a search entry point (it's the one URL carried over from `/guides`). CLS is a Core Web Vitals metric Google uses, with a 0.1 field threshold. The interesting part is that the empty-state branch three lines below already does it right, with `aspect-16/10`.
- **Fix:** Pass real intrinsic dimensions — import the screenshots as static assets so `next/image` infers `width`/`height` automatically, or add `width`/`height` props to `PostFigureProps` and pass them from the MDX. Failing that, mirror the placeholder branch and wrap the image in a fixed `aspect-*` container.

### F11 — Guide screenshot URLs move without a redirect

- **What:** `git ls-tree main` shows six files under `public/guides/gemini/`; they now live at `public/blog/gemini/` and the MDX references `/blog/gemini/…`. `next.config.ts:11-14` redirects `/guides` and `/guides/:slug` only — `:slug` matches a single path segment, so `/guides/gemini/1-open-dashboard.png` matches neither rule. All six URLs are live today (verified: `https://tools.timonwa.com/guides/gemini/1-open-dashboard.png` → 200) and will 404 at deploy.
- **Why it matters:** The migration rule is 1:1 301s for _every_ changed URL, not just HTML. These six are indexed in Google Images, are the only images on the site's strongest content page, and are the kind of URL people hotlink from tutorials and forum answers. A 404 loses that image ranking and re-earning it takes a full recrawl.
- **Fix:** Add `{ source: "/guides/gemini/:file", destination: "/blog/gemini/:file", permanent: true }` to `redirects()`. A broader `{ source: "/guides/:path*", destination: "/blog/:path*", permanent: true }` would cover the pages and the assets in one rule and future-proof any nested path.

### F12 — Meta descriptions run past the snippet limit

- **What:** `SITE_DESCRIPTION` (`src/lib/config/site.ts:13`) is 193 characters and is the description for the home page plus any page that doesn't override it. Tool descriptions: `svg-to-jsx` 184, `lorem-ipsum` 171, `slug-generator` 159, `article-to-social-posts` 153. The rest sit at a healthy 140–152.
- **Why it matters:** Google truncates around 155–160 characters. `SITE_DESCRIPTION` loses ", generate slugs, and more. No sign-up, open source." — and "No sign-up, open source" is the site's actual differentiator. Same shape of loss on the two long tool descriptions.
- **Fix:** Trim `SITE_DESCRIPTION` to ~155 with the differentiator moved forward; the site already has a shorter variant (`SITE_TAGLINE`, 96 chars) proving the copy can compress. Trim `svg-to-jsx` and `lorem-ipsum` to match the ~150 house length.

### F13 — The new sections have no breadcrumbs

- **What:** `Breadcrumbs` (which emits `BreadcrumbList` JSON-LD at `src/components/ui/blocks/Breadcrumbs/index.tsx:21-30`) is used by `components/tools/index.tsx`, `components/categories/index.tsx`, `CategoryDetail.tsx`, and `_shared/tool/ToolBreadcrumbs.tsx`. It is used by none of `components/blog/`, `components/blog/post/`, `components/newsletter/`, `components/newsletter/issue/`, `components/shop/`, or `components/shop/product/`.
- **Why it matters:** Breadcrumb rich results are one of the few SERP features still reliably displayed, and the component to produce them already exists and is already wired for JSON-LD. Blog posts and product pages are precisely the deep pages that benefit most from a visible Home › Blog › Post trail — both for the SERP breadcrumb and for the upward internal link. Post pages currently have exactly one link back to their section (`PostPageFooter`) and nothing to Home except the navbar brand.
- **Fix:** Add `<Breadcrumbs>` to the six new section components with the existing item shape — `[{ Home, ROUTES.home }, { Blog, ROUTES.blog }, { post.title }]` and the newsletter/shop equivalents. Zero new plumbing.

### F14 — Sitemap `lastModified` is missing on every non-content URL

- **What:** `sitemap.ts` sets `lastModified` only for posts (line 50) and issues (line 66). Home, `/tools`, `/categories`, the four category pages, all nine tool pages, `/blog`, `/newsletter`, and `/shop` ship with `changeFrequency` and `priority` but no date.
- **Why it matters:** `changeFrequency` and `priority` are hints Google has said it ignores; `lastModified` is the one field it actually uses to prioritize recrawls. During a rebrand — when the fastest possible recrawl of the whole site is the goal — every URL should carry a fresh date.
- **Fix:** For the tool and index routes, derive a build-time date (a module-level constant, as `HubFooter.tsx:20` already does for the copyright year) or a per-tool `updatedAt` in the `TOOLS` registry. For `/blog`, `/newsletter`, and `/shop`, use the newest child's date.

### F15 — FAQPage comment overstates rich-result eligibility

- **What:** `src/components/_shared/content/ToolContent.tsx:63` comments "FAQPage structured data — eligible for FAQ rich results", and the docstring at line 9 repeats it. Google restricted FAQ rich results to a small set of authoritative government and health sites in August 2023; they no longer display for sites like this one.
- **Why it matters:** Not a defect in the emitted markup — `FAQPage` is still useful for entity understanding and AEO extraction, and the nine tool pages are the right place for it. But the comment will lead a future reader (or agent) to invest in FAQ blocks expecting a SERP feature that can't appear, and to misread flat FAQ CTR as an implementation bug.
- **Fix:** Reword to state the real value — that the FAQ markup aids entity understanding and answer-engine extraction, not rich results. Keep the markup.

### F16 — `robots.ts` is not environment-gated

- **What:** `src/app/robots.ts:8` returns `{ rules: { userAgent: "*", allow: "/" } }` unconditionally. `isProduction` is exported from `@env` and already gates analytics in the root layout (`layout.tsx:76`), so the mechanism is right there.
- **Why it matters:** Any non-production deployment serves a fully permissive `robots.txt`, and a crawlable preview is a whole-site duplicate. Mitigating factor: the site is on Vercel (confirmed via `server: Vercel` response header) and Vercel adds `X-Robots-Tag: noindex` to preview deployments by default, so today this is defense-in-depth rather than an active hole. It becomes real the moment a preview is served from a custom domain or the host changes.
- **Fix:** Return `{ rules: { userAgent: "*", disallow: "/" } }` when `!isProduction`, and keep the sitemap reference production-only. Note the current allow-all is otherwise correct and good for GEO — GPTBot, PerplexityBot, and ClaudeBot are all permitted, which matches the stated intent in `public/llms.txt`.

### F17 — No Search Console verification in the codebase

- **What:** `grep -rn "verification\|google-site"` across `src/` returns nothing, and root `metadata` has no `verification` key.
- **Why it matters:** Search Console is the only source of field CWV data and coverage reporting, and it's the tool that will tell you whether the `/guides` → `/blog` migration landed. **Needs confirmation** — verification may already be in place via a DNS TXT record, which wouldn't appear in the repo.
- **Fix:** If DNS-verified, no change needed. Otherwise add `verification: { google: "…" }` to the root layout metadata. Either way, after deploy: resubmit the sitemap, watch the `/guides` URLs move to "Page with redirect", and confirm the new sections get indexed.

### F18 — Three different ways to emit JSON-LD

- **What:** `JsonLdScript` (`src/components/_shared/content/JsonLdScript.tsx`) exists and is used by the six new section components. The nine tool layouts hand-roll the identical `<script dangerouslySetInnerHTML>` with the same `.replace(/</g, "\\u003c")` (e.g. `src/app/(tools)/word-counter/layout.tsx:89-94`), and so do `ToolContent.tsx:61-67` and `Breadcrumbs/index.tsx:94-99`.
- **Why it matters:** No live vulnerability — every copy applies the `<` escape correctly, so the XSS-safety requirement is met eleven times over. The risk is drift: the next hand-rolled copy is the one that forgets the escape, and a future change to the escaping strategy has to be made in eleven places.
- **Fix:** Replace the raw `<script>` blocks with `<JsonLdScript data={jsonLd} />`. `Breadcrumbs` is a client component but `JsonLdScript` is a plain function with no server-only dependency, so it works there too.

### F19 — Dynamic OG image alt text is a per-section constant

- **What:** `src/app/blog/[slug]/opengraph-image.tsx:9` exports `alt = "Blog post — The Productivity Bug"` for every post; the shop and newsletter equivalents do the same ("Product — …", "Newsletter issue — …"). The image _content_ is fully per-item — it interpolates `ogSubtitle`, `ogPills`, and the split title.
- **Why it matters:** Small win, cheap fix. The rest of the social setup is genuinely good: `OG_SIZE` is exactly 1200×630, `summary_large_image` throughout, absolute `metadataBase`-resolved URLs, and per-item OG imagery. `alt` is the one field that stayed generic.
- **Fix:** `alt` can be a function of `params` in the same file — return `` `${post.title} — ${SITE_NAME}` ``. Note `/categories`, `/categories/[category]`, and `/tools` have no section OG image at all and inherit the root one (F23).

### F20 — Commercial outbound links aren't qualified

- **What:** `ProductCheckoutCta.tsx:15` and `StickyCheckout.tsx:44` render checkout links with `rel="noopener noreferrer"` only. The targets are Buy Me a Coffee / Selar URLs carrying `utm_source=tools_timonwa_com&utm_medium=referral&utm_campaign=…`.
- **Why it matters:** Google's link spam policy asks that links to commercial/monetized destinations be qualified with `rel="sponsored"` or `nofollow`. These are the author's own products rather than third-party affiliate links, which is the mitigating case — but the UTM campaign tagging makes the commercial relationship explicit, and qualifying them costs nothing.
- **Fix:** Add `sponsored` to the `rel` on both checkout links: `rel="noopener noreferrer sponsored"`.

### F21 — No draft or scheduling gate in the content loader

- **What:** `createMdxLoader`'s `getSlugs()` (`src/lib/server/utils/create-mdx-loader.utils.ts:58-65`) returns every `.mdx` file matching `/^[a-z0-9-]+$/`, and `getAll()` maps over all of them. No schema has a `draft` field. So any file dropped into `src/content/blog/` is immediately prerendered, sitemapped, and linked from the home page and footer — and a future `publishedAt` doesn't hold it back.
- **Why it matters:** This is the mechanism that would have prevented F3 — there's no way to commit work-in-progress content without publishing it. Once a thin or unfinished URL is crawled, removing it means a 404 or a redirect rather than simply never having shipped it.
- **Fix:** Add `draft: z.boolean().default(false)` to the three frontmatter schemas and filter it out in `getAll`/`getSlugs`; optionally also filter `publishedAt > today` so posts can be dated ahead. One change in the shared loader covers blog, newsletter, and shop.

### F22 — Raw-markdown image fallback has no dimensions

- **What:** `src/mdx-components.tsx:107-115` maps `img` to a bare `<img>` with a className and `alt`, no `width`/`height`. The comment correctly says screenshots should use `PostFigure`; this is the escape hatch for `![alt](src)` syntax.
- **Why it matters:** Same CLS mechanism as F10, smaller blast radius — no current content file uses raw markdown images, so this is latent rather than live. It becomes real the first time someone writes standard markdown image syntax in a post.
- **Fix:** Either forward `width`/`height` and require them, or give the fallback an `aspect-*` wrapper. Simplest: have the `img` mapping delegate to `PostFigure` so there's one image path.

### F23 — Three routes have no section-specific OG image

- **What:** `src/app/categories/`, `src/app/categories/[category]/`, and `src/app/(tools)/tools/` contain no `opengraph-image.tsx` or `twitter-image.tsx`, so they inherit the root `src/app/opengraph-image.tsx`. Every other public route has its own — the nine tool routes, `/blog`, `/blog/[slug]`, `/newsletter`, `/newsletter/[slug]`, `/shop`, `/shop/[slug]`.
- **Why it matters:** Minor, and it's a coverage gap rather than a break: these three pages still get a valid 1200×630 card. But `/tools` is the site's second-most-important URL by sitemap priority (0.9) and shares the home page's card when linked anywhere social.
- **Fix:** Add an `opengraph-image.tsx` + one-line `twitter-image.tsx` re-export to `(tools)/tools/` and `categories/`, using `renderOgImage` exactly as the other sections do. `categories/[category]/` can be parameterized off `TOOL_CATEGORIES`.

### F24 — Two tool titles compete for "reading time"

- **What:** `reading-time` is titled "Reading Time Estimator — how long an article takes to read"; `word-counter` is titled "Word & Character Counter — reading time & limits" and lists "reading time calculator" in its JSON-LD `keywords` and "Reading and speaking time estimates" in its `featureList`.
- **Why it matters:** Mild cannibalization — two pages on one domain both bidding on "reading time calculator" split the signal, and Google picks one arbitrarily. The primary targets do differ (word/character counting vs. reading time), so this is a keyword-mapping tidy-up, not a consolidation case.
- **Fix:** Let `reading-time` own the query and drop "reading time" from the `word-counter` title in favour of its true primary target ("Word & Character Counter — counts and live limits"), keeping the feature mention in the body. This also helps F8, since that title is 71 chars.

### F25 — Tool breadcrumbs point at a parameterized URL instead of the category page

- **What:** `ToolBreadcrumbs.tsx:23` builds the category crumb as `ROUTES.toolsCategory(category.id)` → `/tools?category=ai`, and that URL also lands in the `BreadcrumbList` JSON-LD `item` (`Breadcrumbs/index.tsx:28`). Meanwhile `/categories/ai` is a real, indexable, sitemapped page (`sitemap.ts:29-35`) whose only internal links come from the `/categories` index and the home `BrowseByCategory` section.
- **Why it matters:** Nine tool pages each pass a category link to a query-parameter URL that canonicalizes back to `/tools` (correctly — `/tools` has a self-canonical at `(tools)/tools/page.tsx:16`, so there's no duplication problem). The waste is that this is nine internal links spent on a non-canonical URL instead of on the category pages the sitemap is trying to get indexed, and the `BreadcrumbList` `item` values point at URLs that aren't canonical.
- **Fix:** Change the crumb to `ROUTES.category(category.id)`. The `/tools?category=…` deep link remains useful for the filter chips inside `FilterableTools` — it just shouldn't be the breadcrumb target or a JSON-LD `item`.

## Scorecard

| Category                  | Score | Notes                                                                                                                                                                    |
| ------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Metadata                  | 6/10  | Every route covered, `metadataBase` + title template + self-canonicals correct; undercut by sitewide title/description overruns (F8, F12) and one-word index titles (F9) |
| Crawlability & indexation | 6/10  | Page-level `/guides` redirects complete and verified against the live sitemap; asset redirects missing (F11), orphan thin page (F6), robots not gated (F16)              |
| Structured data           | 4/10  | Broad type coverage and XSS-safe rendering everywhere, but no entity graph at all (F2), ineligible Product offers (F7), markup not on page (F4)                          |
| Content quality           | 4/10  | Four of five new content URLs are 120–170 words (F3); no bylines, dates, or on-site About/Contact (F4)                                                                   |
| URL structure             | 8/10  | Clean lowercase hyphenated slugs enforced by `SLUG_PATTERN`; typed `ROUTES` builders; 404/error/global-error pages present; one trailing-slash policy                    |
| Core Web Vitals signals   | 7/10  | `next/font`, static rendering, server components, tiny inline theme script; `PostFigure` zero-dimension images are a real CLS hit (F10)                                  |
| Mobile                    | 9/10  | Responsive throughout, no viewport override, no fixed-width layouts, breakpoint-aware breadcrumb collapse                                                                |
| Social                    | 8/10  | Exact 1200×630, `summary_large_image`, absolute URLs, per-item dynamic cards; generic `alt` (F19) and three uncovered routes (F23)                                       |
| AEO / GEO readiness       | 7/10  | `public/llms.txt` is well-formed with usage terms and key pages; all AI crawlers allowed; held back by thin content and no visible dates for citation (F3, F4)           |
| Analytics                 | 7/10  | Umami correctly gated behind `isProduction` from validated env; no Search Console verification found (F17, needs confirmation)                                           |
| Internal noindex          | 10/10 | Single public app, no admin or internal surface — nothing that should be `noindex` is indexable                                                                          |

## Action items

### Fix Now

| #   | Priority | Task (finding ID)                                                                                             | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Resolve the `content-script-generator` canonical → publish the `www` page or self-canonicalize + sitemap (F1) | S      |
| 2   | P0       | Add the `/guides/gemini/:file` (or `/guides/:path*`) redirect before deploy (F11)                             | XS     |
| 3   | P0       | Gate or expand the four thin posts/issues so `/blog` and `/newsletter` don't launch on stubs (F3)             | M      |
| 4   | P1       | Add the `Organization` + `WebSite` `@graph` to the root layout with `alternateName` for the old brand (F2)    | S      |
| 5   | P1       | Add author byline + `<time>` published/updated to post and issue heroes (F4)                                  | S      |
| 6   | P1       | Decide the shop's canonical owner and make index, `ItemList`, `og:url`, and footer links agree (F5)           | M      |
| 7   | P1       | Stop `/categories/media` being an indexable empty page (F6)                                                   | XS     |

### Next Release

| #   | Priority | Task (finding ID)                                                                   | Effort |
| --- | -------- | ----------------------------------------------------------------------------------- | ------ |
| 8   | P2       | Trim `SITE_TITLE`, the title template, and the nine tool titles under 60 chars (F8) | S      |
| 9   | P2       | Give `/blog`, `/newsletter`, `/shop` descriptive intent-bearing titles (F9)         | XS     |
| 10  | P2       | Fix `PostFigure` to reserve intrinsic dimensions (F10)                              | S      |
| 11  | P2       | Trim `SITE_DESCRIPTION` and the two long tool descriptions to ~155 chars (F12)      | XS     |
| 12  | P2       | Add `<Breadcrumbs>` to the six blog/newsletter/shop components (F13)                | S      |
| 13  | P2       | Add `price` + `priceCurrency` to product frontmatter and the `Product` offer (F7)   | S      |
| 14  | P2       | Add `draft` (and future-date) gating to `createMdxLoader` (F21)                     | S      |
| 15  | P3       | Populate `lastModified` for the non-content sitemap URLs (F14)                      | S      |
| 16  | P3       | Confirm or add Search Console verification; resubmit the sitemap post-deploy (F17)  | XS     |

### Backlog

| #   | Priority | Task (finding ID)                                                         | Effort |
| --- | -------- | ------------------------------------------------------------------------- | ------ |
| 17  | P3       | Route all JSON-LD through `JsonLdScript` (F18)                            | S      |
| 18  | P3       | Env-gate `robots.ts` off non-production (F16)                             | XS     |
| 19  | P3       | Make dynamic OG `alt` per item (F19)                                      | XS     |
| 20  | P3       | Add OG images for `/tools`, `/categories`, `/categories/[category]` (F23) | S      |
| 21  | P3       | Point tool breadcrumbs at `/categories/<id>` (F25)                        | XS     |
| 22  | P3       | Reword the FAQPage rich-result comment (F15)                              | XS     |
| 23  | P4       | Add `rel="sponsored"` to checkout links (F20)                             | XS     |
| 24  | P4       | Re-target the `word-counter` title away from "reading time" (F24)         | XS     |
| 25  | P4       | Give the raw-markdown `img` fallback dimensions (F22)                     | XS     |

## Resolved since last audit

First run — nothing to compare against.
