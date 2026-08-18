# Audit suite roll-up

**Date:** 2026-08-17 **Phase:** production **Mode:** Report-only **Branch:** `code-restructuring` **Scope:** single Next.js app (whole repo) **Overall:** 6.5/10

The app is live at `https://tools.timonwa.com`, but this branch is unmerged — the live site still serves the pre-rebrand build (`/blog`, `/newsletter`, `/shop`, `/llms.txt` currently 404). Findings about those routes are pre-deploy, not live regressions.

## Suite summary

| Audit                    | Score  | Critical | High   | Med    | Low    | Trend  | Report                                           |
| ------------------------ | ------ | -------- | ------ | ------ | ------ | ------ | ------------------------------------------------ |
| codebase-audit ✅        | 9/10   | 0        | 1      | 1      | 1      | ▲ +2   | [codebase-audit.md](codebase-audit.md)           |
| conventions-audit ✅     | 9/10   | 0        | 0      | 1      | 1      | ▲ +2   | [conventions-audit.md](conventions-audit.md)     |
| security-audit           | 7/10   | 0        | 3      | 4      | 4      | —      | [security-audit.md](security-audit.md)           |
| environment-audit ✅     | 9.5/10 | 0        | 0      | 0      | 0      | ▲ +2.5 | [environment-audit.md](environment-audit.md)     |
| dependency-audit ✅      | 9/10   | 0        | 0      | 0      | 0      | ▲ +2   | [dependency-audit.md](dependency-audit.md)       |
| frontend-audit           | 7/10   | 0        | 1      | 8      | 5      | —      | [frontend-audit.md](frontend-audit.md)           |
| docs-audit               | 7/10   | 0        | 5      | 7      | 11     | —      | [docs-audit.md](docs-audit.md)                   |
| performance-audit        | 6.5/10 | 0        | 2      | 8      | 4      | —      | [performance-audit.md](performance-audit.md)     |
| seo-code-audit           | 6/10   | 0        | 4      | 9      | 12     | —      | [seo-code-audit.md](seo-code-audit.md)           |
| accessibility-audit      | 6/10   | 0        | 8      | 11     | 7      | —      | [accessibility-audit.md](accessibility-audit.md) |
| redis-audit              | 5/10   | 0        | 3      | 5      | 4      | —      | [redis-audit.md](redis-audit.md)                 |
| **Raw total (open)**     |        | **0**    | **33** | **74** | **63** |        |                                                  |
| **After de-duplication** |        | **1**    | **20** | —      | —      |        |                                                  |

First run — no trend data. Skipped, with reasons: `storybook-audit` (no Storybook configured), `api-audit` (no route-handler layer; Server Action concerns covered by security + frontend), `rbac-audit` (no auth, roles, or protected objects exist), `firestore-audit` (no Firebase). `redis-audit` was added beyond the orchestrator's table because Upstash Redis is a real integration here.

## Top priorities (cross-cutting, worst-first)

1. ~~**CRITICAL — `next@16.2.10` carries 3 reachable advisories.**~~ **FIXED** in the dependency pass — bumped to 16.2.11 with `eslint-config-next` and `@next/mdx` in lockstep; `pnpm audit` is now clean. Original detail: Server Action DoS and unauthenticated disclosure of internal Server Function endpoints both hit this app's only dynamic surface; all are fixed in 16.2.11 (latest 16.3.1, non-major). Dependabot's branch `origin/dependabot/npm_and_yarn/npm_and_yarn-1c4f37dfd6` has held the fix since 2026-07-28. → codebase F1, security F1, dependency F1.
2. ~~**HIGH — Server Action inputs are never validated.**~~ **FIXED** in the security pass — every action parses a bounded Zod schema before any other work, with `style` a closed object rather than a stringified passthrough. Original detail: `existing`, `primaryKeyword`, and `style` are interpolated straight into the Gemini prompt, bypassing the 15 000-char cap that only guards `source.text`; `style` is `JSON.stringify`-ed unbounded, `existing[]` and `xThreadLength` are uncapped, and `LONGFORM_SOCIAL_POST_LENGTH_LIMITS[style.postLength]` can return `undefined` while typed `number`. One allowed request can carry megabytes on the platform key. → security F2, codebase F4, frontend F4.
3. ~~**HIGH — every cost control fails open or silently no-ops.**~~ **FIXED** in the environment pass — metering now follows the Upstash credentials instead of `APP_ENV`, and a built app that cannot meter refuses hosted generations rather than serving them unmetered. Original detail: `APP_ENV` defaults to `development`, the Upstash vars are `.optional()`, and the limiter catches all Redis errors and allows the request. A missing, typo'd, or rotated credential on deploy is indistinguishable from working rate limiting, leaving the hosted Gemini key uncapped with no boot error or alert. Public preview deploys are uncapped by the same mechanism. → environment F1 + F2, redis F1 + F2, security MEDIUM.
4. ~~**HIGH — `subscribeNewsletter` is unauthenticated, unthrottled, and leaks membership.**~~ **FIXED** in the redis pass — metered under its own namespace, honeypot added, and one confirmation message for both subscribed and already-subscribed. Also closes `security-audit` F3. Original detail: No rate limit, captcha, or honeypot on a Server Action that writes to Sender.net with the server token, and its "already subscribed" branch is a membership oracle. → security F3, redis F3, frontend F5.
5. ~~**HIGH — CI is bypassable.**~~ **FIXED** — `predicate-quantifier: every`, so a docs-only skip requires _every_ changed file to be docs. Closes `codebase F2` and `docs F5`; both will be marked in their own passes. Original detail: `dorny/paths-filter` defaults to `predicate-quantifier: some`, so any PR touching one `.md`/`.mdx` file skips lint, format, typecheck, and build while reporting green — verified against commit `26407b5` (2 md + 117 ts files). → codebase F2, docs F5.
6. **HIGH ×4 — the design tokens fail WCAG contrast (one root cause).** Filled primary buttons 4.24:1 (hub) and 3.24–4.47:1 across the nine tool accents; `text-primary` as small text 3.38–4.67:1 on white and 3.03:1 on `bg-primary/10` across 51 usages; `--ring` 2.59:1 as the _only_ focus affordance while `Button` sets `outline-none`; `--border`/`--input` 1.26:1 light / 1.47:1 dark, the sole thing distinguishing form fields from the page. Fixing the token values in `src/styles/tokens.css` fixes all four. → accessibility F5–F8.
7. **HIGH ×4 — focus management and async announcement.** `Drawer` declares `aria-modal="true"` with no Tab trap; opening the BYOK/settings drawer from the nav menu drops focus to `<body>`; no skip link anywhere, with 8+ header tab stops before content on every page (WCAG 2.4.1, Level A); AI generation start/finish is never announced and the focused submit button self-disables mid-run. → accessibility F1–F4.
8. **HIGH — a paid product page canonicalizes to a 404.** `/shop/content-script-generator` points at `https://www.timonwa.com/shop/content-script-generator`, verified 404 over the network (the other five product canonicals are 200). Combined with the deliberate sitemap exclusion, the only page for a $10 product self-excludes with no valid target. → seo F1.
9. **HIGH ×3 — the structure docs contradict the code and each other.** Both AGENTS.md and CONTRIBUTING.md still show `app/`, `components/`, `lib/` at the repo root after the move under `src/`; AGENTS.md says feature PRs target `dev` while CONTRIBUTING.md says branch from and PR against `main`. Introduced during this refactor. → docs F1–F3.
10. ~~**HIGH — the `postcss` override has gone stale.**~~ **FIXED** — floor raised to `>=8.5.23`, resolving postcss 8.5.26 and nanoid 3.3.18. Original detail: It is still necessary (Next pins postcss 8.4.31 exactly), but its `>=8.5.10` floor no longer patches: the lockfile resolved 8.5.17, carrying a high advisory fixed in 8.5.18, and drags `nanoid` 3.3.15 with two high advisories. Build-time-only reachability; one-line fix to `>=8.5.23`. → dependency F2, codebase F1.
11. ~~**HIGH ×2 — the nine tool layouts duplicate and hardcode.**~~ **FIXED** in the conventions pass — 99 lines each became 18, with SEO copy in one registry and metadata/JSON-LD built from it; built HTML verified identical. Original detail: Each hardcodes `const TOOL_PATH = "/<slug>"` for canonicals and JSON-LD instead of `ROUTES.tool()` (which AGENTS.md explicitly forbids), and each repeats ~70 lines of identical `Metadata` + `WebApplication` scaffolding, re-inlining escaping that the shared `JsonLdScript` owns — leaving tool copy with four competing sources of truth. → conventions F1 + F2.
12. **HIGH — no test infrastructure at all** (DEFERRED by decision — tests are a separate branch; the dead CI job that claimed otherwise was removed), and the CI test job is hard-disabled with `if: false` while invoking a nonexistent script. The SSRF blocklist, quota logic, and ordered error-mapping rules are all uncovered. → codebase F3.
13. ~~**HIGH — 26 OG/Twitter image routes opt into `runtime = "edge"`.**~~ **CORRECTED, then fixed** — testing showed removing `edge` does _not_ restore static generation (non-parameterized image routes are dynamic either way), so the premise was wrong; the real defect was three contradictory comments, now one accurate note per route. Original detail: which the build explicitly warns disables static generation; every image route is `ƒ Dynamic` while every page is `○ Static`. → frontend F1, performance F3. Whether `edge` is needed at all on Next 16 is **unconfirmed** (docs read was denied in-session).
14. **HIGH — layout shift on every blog post.** `next/image` is called with `width={0} height={0}`, reserving no space for all six lazy screenshots — confirmed in the prerendered HTML. → performance F1.
15. **HIGH — a synchronous `localStorage` write per keystroke.** With source-reuse on, `setText` serialises the entire article on every keypress in the AI tools and word counter. → performance F2.
16. **HIGH — the structured-data graph is disconnected.** No `Organization`/`WebSite` node and no `@id` anywhere; the home page renders zero JSON-LD, so every block is an island — and no `alternateName` teaches Google about the rebrand from "Tools by Timonwa". → seo F2.
17. **HIGH — thin content marked up as articles.** Four of the five new content files are 120–170 words yet are sitemapped and typed `BlogPosting`/`Article`. → seo F3.
18. **HIGH — invisible authorship.** Post and issue pages render no byline and no date (no `<time>` element on any detail page) while their JSON-LD asserts `author`, `datePublished`, and `dateModified`. → seo F4.
19. ~~**HIGH — the character budget has two sources of truth.**~~ **FIXED** — `DEFAULT_MAX_CHARS` deleted; the component defaults to `MAX_ARTICLE_INPUT_CHARS`. Original detail: `DEFAULT_MAX_CHARS = 15000` in `ArticleSourceInput` shadows `MAX_ARTICLE_INPUT_CHARS = 15_000`, so the on-screen counter and the server's `ARTICLE_TOO_LONG` guard can drift apart. → conventions F3.
20. ~~**HIGH — a factory was hand-rolled and has already diverged.**~~ **FIXED** in the codebase pass — `useSeoMetaHistory` calls `createToolHistory`, restoring the lost entry guard. Original detail: `useSeoMetaHistory` reimplements `createToolHistory` (which its social-posts sibling calls in five lines) and is missing the `!!result` entry guard. → conventions F4.

## Action items

Phase `production` → **Fix Now** / **Next Release** / **Backlog**.

### Fix Now

1. ~~Bump `next` to 16.2.11+ and re-run `pnpm audit`.~~ **DONE** (dependency pass) [P1]
2. ~~Raise the `pnpm-workspace.yaml` postcss override to `>=8.5.23`.~~ **DONE** (dependency pass) [P10]
3. ~~Zod-validate every Server Action input at the boundary.~~ **DONE** (security pass) [P2]
4. ~~Make cost control fail loudly.~~ **DONE** (environment pass — fails closed, with a boot error; transient Redis errors still fail open by design) [P3]
5. ~~Rate-limit `subscribeNewsletter`, add a honeypot, and return an identical response.~~ **DONE** (redis pass) [P4]
6. ~~Fix `ci.yml`'s `paths-filter` to `predicate-quantifier: every`.~~ **DONE** (shipped with the environment pass, which touched the same file) [P5]
7. Fix the `content-script-generator` canonical — publish the `www` page or point the canonical at the local URL and re-include it in the sitemap. [P8]
8. Correct the AGENTS.md and CONTRIBUTING.md structure trees to `src/`, and reconcile the branch model to one answer. [P9]

### Next Release

9. Re-tune the contrast-failing tokens in `src/styles/tokens.css` (primary/foreground pairs, `text-primary`, `--ring`, `--border`/`--input`). [P6]
10. Add a Tab focus trap to `Drawer`, fix the nav-menu → drawer focus handoff, add a skip link plus `id` on `<main>`, and announce AI generation via a live region without dropping focus on the submit button. [P7]
11. Give `PostFigure` real intrinsic dimensions. [P14]
12. Debounce or idle-defer the article `localStorage` write. [P15]
13. Stop the root-layout footer re-parsing all content on every route, and declare cache tiers now that `cacheComponents` is on. [frontend caching 4/10, performance]
14. ~~Point the nine tool layouts at `ROUTES.tool()` and extract the shared builder.~~ **DONE** (conventions pass) [P11]
15. ~~Collapse the character cap to one constant; replace `useSeoMetaHistory`'s hand-rolled store.~~ **DONE** (conventions + codebase passes) [P19, P20]
16. Add `Organization` + `WebSite` JSON-LD with `@id` wiring and `alternateName`, and render visible author/date on posts and issues. [P16, P18]
17. Fix the PR template's nonexistent `pnpm check` and list the gates CI actually runs. [docs F4]

### Backlog

18. Stand up test infrastructure and enable the CI test job (planned as its own branch — the dead `if: false` job has been removed). [P12]
19. ~~Confirm whether OG routes need `runtime = "edge"`.~~ **RESOLVED** (codebase pass — not required, but removing it changes nothing; comments corrected instead) [P13]
20. Expand the four thin content files or de-index them until they earn inclusion. [P17]
21. ~~Add a CSP and security headers.~~ **DONE** (security pass — enforcing CSP plus HSTS, Permissions-Policy, frame/nosniff/referrer headers in `next.config.ts`) [security MEDIUM]
22. Redis hygiene: central key builders, atomic `incr`+`expire`, a burst window, and a single reused client. [redis MEDIUM set]
23. Set up Storybook and stories for `components/ui` (planned as its own branch). [storybook-audit skipped]

## Needs confirmation (cannot be settled from the repo)

- Does the live host set `APP_ENV=production`? There is no `vercel.json`, so rate limiting cannot be verified as active. [environment F1]
- Search Console verification may be a DNS TXT record rather than in code. [seo F17]
- Whether `@ai-sdk/google` puts the API key in a header or the URL, which decides whether verbatim error logging can retain BYOK keys. [environment F9, security F11]
- Upstash eviction policy and per-environment database isolation. [redis F11]
- Whether Next 16 OG routes still require `runtime = "edge"`. [codebase F20]

## Resolved since last run

**Also fixed en route:** `ci.yml`'s `paths-filter` quantifier (`codebase F2` / `docs F5`) — it lived in the same file as environment F7, so it shipped in that commit rather than waiting for its own pass.

**conventions-audit — complete (7/10 → 9/10).** Twenty-two of twenty-five findings fixed. The nine tool route layouts went from 99 lines each to 18, with their SEO copy centralized and metadata/JSON-LD generated — built HTML verified unchanged. Also: an OG colour palette, shared `ItemList`/OG-URL builders, one `IconComponent` type instead of six, a `config/` barrel that deliberately excludes the server-only `env`, and an import cycle removed. One finding was **rejected**: nested folders inside a kind (`utils/text/`) are what the standard prescribes, not a violation of it.

**codebase-audit — complete (7/10 → 9/10).** Seventeen of twenty-one findings fixed. `noUncheckedIndexedAccess` is now on, with all eleven resulting errors fixed by encoding invariants as non-empty tuples rather than asserting past them. Blind catch blocks now log and classify instead of blaming the network, BYOK storage reports whether a write landed, the duplicated history factory is gone, and dead code/config removed. Deferred by decision: test infrastructure (own branch) and local branch cleanup. Routed to `frontend-audit`: the four oversized components.

**security-audit — complete (7/10 → 9/10).** All eleven findings closed — five were already resolved by the dependency, environment, and redis passes; this pass added Zod validation at every Server Action boundary, an enforcing CSP and full security-header set, two SSRF denylist gaps, and made `IP_HASH_SECRET` required in production. Note the CSP is enforcing and only observable in a real browser, so it is worth a console check after deploy.

**redis-audit — complete (5/10 → 9/10).** Eleven of twelve findings fixed. The limiter was restructured: one atomic Lua script charges the per-user, burst, and pool tiers together (so a denied request is never charged and no counter can lose its TTL), keys and TTLs moved into a `clients/redis/` module, one pooled client replaced per-call construction, and the failure direction flipped to closed — with a fallback to the previous command path so a scripting defect degrades instead of causing an outage. Newsletter signup is now metered and honeypotted, which also closes `security-audit` F3. One database serves every environment, so every key is tier-scoped to stop previews spending production's pool.

**environment-audit — complete (7/10 → 9.5/10).** All nine findings closed — eight in code, and `.env.example` applied by the maintainer (this session cannot read or write `.env*`). Upstash credentials confirmed present on the live host. The suite's last CRITICAL-adjacent risk is gone: hosted AI generations fail closed, so no configuration mistake can serve unmetered spend on the platform key. Also closes the fail-open half of `redis-audit` F1/F2.

**dependency-audit — complete (7/10 → 9/10).** All 8 actionable findings fixed, 1 accepted (no provenance available), 1 deferred by project policy (version drift with no advisory). `pnpm audit` went from 21 advisories (14 high / 7 moderate) to **zero**. This also closed the suite's only CRITICAL and two HIGH items carried by `codebase-audit` (F1) and `security-audit` (F1) — those will be marked FIXED when their own passes run, not re-examined.

Overall suite score is unchanged at 6.5/10 pending the remaining passes; it is recalculated only when every audit has had its pass.

## What held up under red-teaming

Recorded so future runs don't re-litigate: zero `process.env` reads outside the validated `env.ts`; no `NEXT_PUBLIC_*` variables and no secret in any of 210 commits; the `server-only` boundary intact, with `HubFooter` correctly excluded from the `_shared/layout` barrel; explicit one-export-per-file kind barrels with `export *` only in the sanctioned `ui/index.ts`; no `Type`-suffixed types, no rename-on-import, fully namespaced storage keys and DOM events; thin content route entries building paths from `ROUTES`; `/guides` → `/blog` redirect coverage complete and verified against the live sitemap; slug allowlisting, BYOK quota non-bypass, model allowlisting, right-most `x-forwarded-for` parsing, and JSON-LD escaping all sound; zero TODO/FIXME markers, zero `any`, zero unsafe casts, and `tsc` + `lint` + `build` all pass.
