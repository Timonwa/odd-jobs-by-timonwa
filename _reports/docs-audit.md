# Docs audit — The Productivity Bug (root documentation surface)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `code-restructuring` · **Scope:** `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, `SECURITY.md`, `LICENSE`, `LICENSE-content`, `TRADEMARK.md`, `.github/**` templates + workflow doc-logic, `public/llms.txt` — verified against `src/**`, `package.json`, `next.config.ts`, `tsconfig.json`, `.env` schema, and the live site. The gitignored `docs/` folder was excluded. · **Overall:** 7/10

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | N/A      | 7/10    | N/A | N/A   |

First run — no prior `_reports/docs-audit.md`, so every finding is `NEW` and there is nothing to carry forward.

## Findings

| ID  | Severity | Category        | Status | Issue                                                                                        | Location                               |
| --- | -------- | --------------- | ------ | -------------------------------------------------------------------------------------------- | -------------------------------------- |
| 1   | HIGH     | Stale claims    | NEW    | Repository-structure tree puts the App Router at root `app/`; it lives at `src/app/`         | `AGENTS.md:37`                         |
| 2   | HIGH     | Stale claims    | NEW    | Codebase-layout tree shows `app/`, `components/`, `lib/` at repo root; all three are `src/*` | `CONTRIBUTING.md:72`                   |
| 3   | HIGH     | Stale claims    | NEW    | Branch model contradicts itself: PRs target `dev` (AGENTS) vs `main` (CONTRIBUTING)          | `AGENTS.md:92` / `CONTRIBUTING.md:147` |
| 4   | HIGH     | README accuracy | NEW    | PR checklist requires `pnpm check`, a script that does not exist                             | `.github/pull_request_template.md:16`  |
| 5   | HIGH     | Stale claims    | NEW    | CI's `docs-only` gate skips lint/typecheck/build for any PR that touches one `.md`           | `.github/workflows/ci.yml:22`          |
| 6   | MEDIUM   | Stale claims    | NEW    | Action filename documented as `<slug>.action.ts`; real convention is `<domain>.action.ts`    | `AGENTS.md:30` / `CONTRIBUTING.md:121` |
| 7   | MEDIUM   | Stale claims    | NEW    | "barrel per kind" / "every kind barrel" — `src/lib/config/` has no barrel                    | `AGENTS.md:47` / `CONTRIBUTING.md:113` |
| 8   | MEDIUM   | Stale claims    | NEW    | `src/content/tools/` is not loaded by a service or validated by Zod, as documented           | `AGENTS.md:169`                        |
| 9   | MEDIUM   | Duplication     | NEW    | Scripts/verify commands maintained in 3 docs with 4 different command sets                   | `README.md:76` / `CONTRIBUTING.md:55`  |
| 10  | MEDIUM   | Links & URLs    | NEW    | Issue-chooser links GitHub Discussions; Discussions is disabled on the repo                  | `.github/ISSUE_TEMPLATE/config.yml:4`  |
| 11  | MEDIUM   | Coverage        | NEW    | README env table omits `APP_ENV` and mislabels `GOOGLE_API_KEY` as required                  | `README.md:64`                         |
| 12  | MEDIUM   | Stale claims    | NEW    | CI comment claims a missing `GOOGLE_API_KEY` fails the build, and names Cloudflare Analytics | `.github/workflows/ci.yml:74`          |
| 13  | LOW      | Duplication     | NEW    | Whole dev-setup block duplicated verbatim in README and CONTRIBUTING                         | `README.md:48` / `CONTRIBUTING.md:41`  |
| 14  | LOW      | Consistency     | NEW    | Node requirement stated as 20.9+; repo standardizes on 22 and enforces nothing               | `README.md:50` / `CONTRIBUTING.md:43`  |
| 15  | LOW      | Stale claims    | NEW    | JSON-LD escape claim is mangled to a no-op — `` `<` → `<` `` instead of `<`                  | `AGENTS.md:160`                        |
| 16  | LOW      | Stale claims    | NEW    | `src/styles/` described as tokens/theme/base only; three more partials exist                 | `AGENTS.md:41`                         |
| 17  | LOW      | Stale claims    | NEW    | Rate-limit key format omits the client-hash segment                                          | `AGENTS.md:165`                        |
| 18  | LOW      | Stale claims    | NEW    | "never `export *`" stated without noting `src/components/ui/index.ts` does exactly that      | `AGENTS.md:47`                         |
| 19  | LOW      | Coverage        | NEW    | Neither structure tree lists `src/mdx-components.tsx`, required by the MDX setup             | `AGENTS.md:37` / `CONTRIBUTING.md:72`  |
| 20  | LOW      | Coverage        | NEW    | Documentation inventory omits SECURITY/TRADEMARK/`.github` templates/`public/llms.txt`       | `AGENTS.md:239`                        |
| 21  | LOW      | Links & URLs    | NEW    | `/blog`, `/newsletter`, `/shop` advertised in README + llms.txt 404 on the live site today   | `README.md:14` / `public/llms.txt:13`  |
| 22  | LOW      | Consistency     | NEW    | SECURITY.md cites CONTRIBUTING.md for a statement CONTRIBUTING.md doesn't make               | `SECURITY.md:54`                       |
| 23  | LOW      | Consistency     | NEW    | Two `# ` H1s in one file                                                                     | `AGENTS.md:3`, `AGENTS.md:9`           |

### F1 — AGENTS.md structure tree puts the App Router at root `app/`

- **What:** The "Repository Structure" block opens with `app/` and then prefixes every sibling with `src/` (`src/styles/`, `src/components/`, `src/lib/`, `src/content/`). On this branch there is no root `app/` directory — `find` returns 70 route files, all under `src/app/` (`src/app/layout.tsx`, `src/app/(tools)/word-counter/page.tsx`, …). `git ls-tree origin/main` still shows a root `app/`, which is where the stale line comes from: the directory moved during the refactor and the tree wasn't updated.
- **Why it matters:** This is the highest-traffic paragraph in the file, and it's the one an agent reads before creating a route. A file created at `app/<slug>/page.tsx` is not routed by Next at all, and a human reading the same block will look for routes in the wrong place. The intra-block inconsistency (`app/` bare, everything else `src/`-prefixed) makes it read as deliberate.
- **Fix:** Change the tree root to `src/app/` (and the nested `(tools)/`, `blog/ newsletter/ shop/` lines stay relative to it).

### F2 — CONTRIBUTING.md codebase-layout tree is unprefixed for three top-level dirs

- **What:** The tree lists `app/` (line 73), `components/` (line 82), and `lib/` (line 98) at the root, with only `src/styles/` (line 81) carrying the `src/` prefix. Actual: `src/app/`, `src/components/`, `src/lib/` — verified by `ls src` (`app components content lib mdx-components.tsx styles`). There is no root-level `app/`, `components/`, or `lib/`.
- **Why it matters:** This is the onboarding map for external contributors, and it's the section CONTRIBUTING is pointed at from both README and AGENTS.md ("For the full tool anatomy and dev setup, see CONTRIBUTING.md"). It also disagrees with AGENTS.md, which does use `src/components/` and `src/lib/` — so a contributor comparing the two docs gets two different layouts.
- **Fix:** Prefix all four top-level entries with `src/`, matching AGENTS.md, and keep the "Anatomy of a tool" paths (`components/tools/<slug>/`, `lib/server/…`) consistent with whichever convention you pick — currently they're bare too.

### F3 — The two docs give contributors different base branches

- **What:** `AGENTS.md:92` states "**Default / base branch**: `main`; active integration branch: `dev` (feature PRs target `dev`)" and `AGENTS.md:94` lists `dev` as protected. `CONTRIBUTING.md:147` says "Fork and branch from `main`" and `CONTRIBUTING.md:158` says "Push and open a PR **against `main`**". Both branches exist (`origin/main`, `origin/dev`; API reports `default_branch: main`), so neither instruction fails loudly — the PR just lands on the wrong branch.
- **Why it matters:** Every external contribution follows CONTRIBUTING; every agent-assisted change follows AGENTS. If `dev` is really the integration branch, contributor PRs bypass it; if `main` is, the AGENTS rule sends agents to a branch the maintainer isn't merging into. `ci.yml` only has a `push` trigger for `main`, which weakly suggests `main` is the real target and the AGENTS claim is the stale one.
- **Fix:** Pick one model and state it in one place — put the branch model in CONTRIBUTING and have AGENTS.md link it rather than restate it.

### F4 — PR template requires a script that doesn't exist

- **What:** The checklist reads "- [ ] `pnpm check` and `pnpm typecheck` pass". `package.json` scripts are exactly `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`, `prepare` — there is no `check`. Running it errors out.
- **Why it matters:** It's the last thing every contributor reads before submitting, and the one command they're told to run is unrunnable. Worse, the two gates CI actually enforces beyond typecheck — `pnpm lint` and `pnpm format:check` (`ci.yml:57,60`) — aren't named, so a contributor who ticks the box still gets red CI on formatting.
- **Fix:** Replace with the real gate set: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm build` — the same list AGENTS.md:88 uses, so the two agree.

### F5 — The `docs-only` CI skip fires on mixed code+docs PRs

- **What:** `ci.yml` computes `should-skip: ${{ steps.filter.outputs.docs-only == 'true' }}` from `dorny/paths-filter@v3` with no `predicate-quantifier`. The default quantifier is `some`: a filter output is `true` when **any** changed file matches its globs. The `docs-only` filter matches `**/*.md` and `**/*.mdx`. So a PR that changes `src/lib/server/actions/seo-meta.action.ts` **and** `README.md` sets `docs-only=true`, and both `lint-and-typecheck` and `build` are skipped via `if: needs.changes.outputs.should-skip != 'true'`.
- **Why it matters:** Adding a line to a README is the most ordinary thing to do alongside a code change, and it silently disables the only quality gate on a production repo — lint, format check, typecheck, and build all skipped, with the checks reporting green. This is adjacent to the docs surface rather than in it, but the filter exists to serve docs changes, so it belongs here.
- **Fix:** Add `predicate-quantifier: every` to the `paths-filter` step so `docs-only` means what its name says. Also drop the `stale.yml` / `pr-title.yml` globs — AGENTS.md:177 documents both workflows as deliberately absent, and they are.

### F6 — Action files are documented as `<slug>.action.ts`

- **What:** `AGENTS.md:30` ("Action in `lib/server/actions/<slug>.action.ts`") and `CONTRIBUTING.md:121` (step 3, same path) name the file after the tool slug. The real files are `seo-meta.action.ts` and `social-posts.action.ts`, while the slugs are `article-to-seo-meta` and `article-to-social-posts` (`src/lib/config/tools.ts:33,42`). `AGENTS.md:57` states the actual convention correctly — `<domain>.action.ts` — so the file contradicts itself two lines apart in the same document.
- **Why it matters:** An agent following the "what this is" section names the new file `article-to-<x>.action.ts` and immediately breaks the naming convention the same file enforces elsewhere. Same for services: the sibling `<name>.service.ts` phrasing is vague where `<domain>.service.ts` is what's on disk.
- **Fix:** Use `<domain>.action.ts` / `<domain>.service.ts` in all three places, and note that the domain is the short name (`seo-meta`), not the route slug.

### F7 — "barrel per kind" is false for `lib/config/`

- **What:** `AGENTS.md:47` describes `src/lib/` as "kind-first, flat inside each kind; **barrel per kind**, one explicit export line per file", and `CONTRIBUTING.md:113` says "Every kind barrel lists one explicit export line per file". Seven kinds have `index.ts` (`constants`, `data`, `hooks`, `schemas`, `types`, `utils`, `server`); `src/lib/config/` does not. `grep -rn 'from "@/lib/config"' src` returns nothing — config is deliberately imported by direct file path (`@/lib/config/tools`, `@/lib/config/site`).
- **Why it matters:** The convention as written is either violated by the code or misstated by the docs, and an agent will resolve the mismatch by creating `lib/config/index.ts` — inventing a barrel the codebase intentionally avoids (and re-exporting `env.ts`, which is `server-only`, through a client-reachable path).
- **Fix:** State the real rule: barrel per kind **except `config/`, which is imported per-file** (and say why — `env.ts` is `server-only`, so a config barrel would drag it into client bundles).

### F8 — `src/content/tools/` isn't loaded or validated the way the docs claim

- **What:** `AGENTS.md:169` says content under `src/content/` — explicitly listing `blog/`, `issues/`, `shop/`, `tools/` — is "loaded by `lib/server/services/` through `create-mdx-loader.utils.ts` (slug allowlist `^[a-z0-9-]+$`, frontmatter validated at build, reading time derived)". True for the first three (`blog.service.ts`, `issues.service.ts`, `shop.service.ts`, with `post.schema.ts` / `issue.schema.ts` / `product.schema.ts`). Not true for `tools/`: the nine `src/content/tools/*.mdx` files are pulled in by a dynamic import in a component — `src/components/_shared/content/ToolContent.tsx:11`, `await import(\`@/content/tools/${currentSlug}.mdx\`)`— with no service, no`create-mdx-loader` slug allowlist, and no Zod schema (`src/lib/schemas/` holds only issue/post/product).
- **Why it matters:** The claim overstates the validation surface, which matters twice: someone auditing input handling concludes all MDX frontmatter is schema-checked at build when a quarter of it isn't, and an agent adding a tool content file expects a loader and schema that don't exist. The `currentSlug` interpolation into a dynamic import is also the one MDX read not behind the documented `^[a-z0-9-]+$` allowlist.
- **Fix:** Either document the exception (tool SEO copy is imported directly by `ToolContent`, frontmatter unvalidated) or bring `tools/` under a `tools.service.ts` + `tool.schema.ts` so the documented rule becomes true.

### F9 — Scripts and verify commands live in three docs with four different command sets

- **What:** The same facts are maintained in four places, and they've already drifted:
  - `README.md:78` — table of 5 scripts (omits `start`, `format:check`)
  - `CONTRIBUTING.md:57` — table of 6 scripts (omits `typecheck`), then `CONTRIBUTING.md:66` tells readers to "Type-check with `pnpm exec tsc --noEmit`" even though a `typecheck` script exists
  - `AGENTS.md:78` — all 7 scripts, correct
  - Verify sets: `AGENTS.md:88` and `:230` say `typecheck && lint && build`; `AGENTS.md:213` says `lint && typecheck && format:check`; `CONTRIBUTING.md:151` says `lint`, `pnpm exec tsc --noEmit`, `build`; the PR template says `check` + `typecheck` (F4). CI runs `lint`, `format:check`, `typecheck`, `build`.
- **Why it matters:** Four sources of truth for one list guarantees the drift already present, and none of the four matches what CI actually gates — so a contributor can follow any of them faithfully and still fail the pipeline.
- **Fix:** Keep the full scripts table in one doc (CONTRIBUTING, since it's the dev-setup home), have README and AGENTS link it, and make every "verify" instruction the exact CI set.

### F10 — Issue chooser links a disabled Discussions tab

- **What:** `.github/ISSUE_TEMPLATE/config.yml` contact link "Ask a Question" → `https://github.com/Timonwa/tools-by-timonwa/discussions`. `gh api repos/Timonwa/tools-by-timonwa` returns `has_discussions: false`, so the feature is off and the URL doesn't resolve to a Discussions page.
- **Why it matters:** It's the first thing shown to anyone opening an issue, and it routes questions into a dead end. CONTRIBUTING.md:16 sends "Questions or ideas" to the issue chooser, so the two compound.
- **Fix:** Enable Discussions, or drop the contact link and point questions at the blank-issue path CONTRIBUTING already documents.

### F11 — README env table omits `APP_ENV` and overstates `GOOGLE_API_KEY`

- **What:** Two defects in the same table (`README.md:64`). (a) `APP_ENV` is absent, yet `src/lib/config/env.ts:9` defines it and `isProduction` (`env.ts:43`) gates both rate limiting and the Umami script (`src/app/layout.tsx:73`); `AGENTS.md:183` and `:177` document it as something you must set explicitly on deploy. (b) The table marks `GOOGLE_API_KEY` "Required ✅", but `env.ts:11` is `z.string().optional()` and the README's own note two lines down (`README.md:74`) says the app builds with nothing set.
- **Why it matters:** Someone self-hosting from the README deploys with rate limiting and analytics silently off, because the one variable that switches them on isn't in the table they're working from. The Required column being wrong also undercuts trust in the rest of the table.
- **Fix:** Add an `APP_ENV` row (`production` on deploy; unset = `development`; gates rate limiting + analytics) and change `GOOGLE_API_KEY` to "Required for the AI tools" rather than a bare ✅.

### F12 — CI env comment describes behavior the code doesn't have

- **What:** `.github/workflows/ci.yml:74-79`: "env.ts validates required vars at module load via Zod. Missing `GOOGLE_API_KEY` fails the build with a Zod error. Optional vars (Upstash, **Cloudflare Analytics**) are left unset". `GOOGLE_API_KEY` is `optional()` in `env.ts:11`, so a missing value does not fail the build; and there is no Cloudflare Analytics anywhere in the repo — analytics is Umami (`src/app/layout.tsx:79`), presumably a leftover from a prior provider.
- **Why it matters:** It documents a build-time guarantee that doesn't exist (someone will rely on CI catching a missing key) and names a service the project doesn't use, which sends anyone auditing third-party data flows looking for the wrong vendor.
- **Fix:** Rewrite the comment: the placeholder key exists only so AI-tool code paths have something to read; all env vars are optional and features degrade. Replace "Cloudflare Analytics" with "Umami".

### F13 — Dev-setup block duplicated verbatim

- **What:** `README.md:48-58` and `CONTRIBUTING.md:41-51` carry byte-identical prerequisites + `git clone` / `cd` / `pnpm install` / `cp .env.example .env` / `pnpm dev` blocks. Both commands are correct today (repo name matches `origin`, `.env.example` exists and is `!`-negated in `.gitignore`).
- **Why it matters:** Not broken, but it's the drift vector that already produced F9 and F14 — two copies of the same fact aging at different rates.
- **Fix:** Keep the quickstart in README (a reader shouldn't need a second file to run the app) and have CONTRIBUTING link `README.md#run-locally`, the same way it already links `README.md#environment-variables`.

### F14 — Node requirement doesn't match what the repo uses

- **What:** README:50 and CONTRIBUTING:43 both state "Node.js 20.9+". `.nvmrc` pins `22`, `.github/actions/setup/action.yml` sets `node-version: "22"`, and `package.json` has no `engines` field at all — so nothing enforces the documented floor and nothing documents the version actually used.
- **Why it matters:** Minor as long as 20.9 works (it satisfies Next 16's floor), but a contributor on Node 20 develops against a runtime CI never exercises, and there's no machine-readable guard either way.
- **Fix:** State "Node.js 22 (see `.nvmrc`)" in both docs, and add `"engines": { "node": ">=20.9" }` if 20.9 is genuinely still supported.

### F15 — JSON-LD escaping claim is a no-op as written

- **What:** `AGENTS.md:160` reads "**JSON-LD** is escaped via `JsonLdScript` (`` `<` `` → `` `<` ``)" — byte-inspected, both sides of the arrow are the single character `<`. The code escapes to `<`: `JSON.stringify(data).replace(/</g, "\\u003c")` (`src/components/_shared/content/JsonLdScript.tsx:7`).
- **Why it matters:** The security bullet describes an identity transform, so the mitigation reads as pointless — and an agent "restoring" the documented behavior would remove the actual escape. Almost certainly a Markdown/escaping accident during the rewrite.
- **Fix:** Write it as `` `<` `` → `` `<` `` (escape the backslash for Markdown).

### F16 — `src/styles/` partial list is incomplete

- **What:** `AGENTS.md:41` says "globals.css + tokens/theme/base partials, imported in order" and `AGENTS.md:117` repeats "layered partials (tokens, theme, base)". `ls src/styles` shows `animations.css`, `base.css`, `components.css`, `globals.css`, `theme.css`, `tokens.css`, `utilities.css` — three partials unmentioned, including `components.css` and `utilities.css`, which is where the docs' own "custom utilities/component classes over repeated class strings" guidance would land.
- **Why it matters:** An agent adding a component class has no idea `components.css` exists and will inline the styles or create a new file.
- **Fix:** List all six partials in import order (`CONTRIBUTING.md:81` already hedges with "tokens/theme/base/... partials" — make both explicit).

### F17 — Rate-limit key format is missing a segment

- **What:** `AGENTS.md:165` documents "counters are Redis keys `ratelimit:<toolSlug>:user|pool:<date>`". Actual (`src/lib/server/utils/rate-limit.utils.ts:90-91`): the user key is `` `ratelimit:${toolSlug}:user:${clientHash}:${date}` `` and only the pool key is `` `ratelimit:${toolSlug}:pool:${date}` ``. The per-user key carries a client-hash segment the doc collapses away.
- **Why it matters:** The shape is the thing you'd use to inspect or purge counters against a live Redis, and the documented pattern matches nothing for the user tier.
- **Fix:** Document the two shapes separately: `ratelimit:<toolSlug>:user:<ipHash>:<date>` and `ratelimit:<toolSlug>:pool:<date>`.

### F18 — "never `export *`" doesn't note the one place it's used

- **What:** `AGENTS.md:47` ("one explicit export line per file (never export \*)") and `CONTRIBUTING.md:113` ("no `export *` from a directory"). Every `lib/` kind barrel complies. `src/components/ui/index.ts:4-7` does not — it is four `export *` lines re-exporting the tier barrels. Both statements sit in a `src/lib/` context, so this reads as an intentionally scoped rule with an undocumented exception rather than a flat violation.
- **Why it matters:** The nearest reading of the rule is repo-wide, so an agent touching `components/ui/index.ts` will either "fix" the root barrel into ~30 explicit lines or treat the rule as advisory.
- **Fix:** Scope the sentence explicitly — "`lib/` kind barrels list one export line per file; the `ui/` root barrel re-exports its four tier barrels with `export *`".

### F19 — `src/mdx-components.tsx` is in neither structure tree

- **What:** `ls src` shows `mdx-components.tsx` at the `src/` root — the file `@next/mdx` requires for MDX component mapping. Neither `AGENTS.md:37` nor `CONTRIBUTING.md:72` lists it, though both trees enumerate `src/`-level entries and both docs describe MDX as a core mechanism (`AGENTS.md:16`, `next.config.ts:18`).
- **Why it matters:** An agent asked to restyle MDX output (headings, code blocks, links) has no pointer to the file that owns it and will reach for the content components instead.
- **Fix:** Add `src/mdx-components.tsx` to both trees with a one-line note ("MDX element mapping required by `@next/mdx`").

### F20 — Documentation inventory undercounts the docs surface

- **What:** `AGENTS.md:239` describes the documentation surface as "README.md (user-facing) + CONTRIBUTING.md (tool anatomy, dev setup, PR workflow)" plus the licensing files. Not listed: `SECURITY.md`, `TRADEMARK.md`, `public/llms.txt` (the AI-crawler policy file), and the `.github/` issue/PR templates — all maintained docs, and TRADEMARK.md is referenced by name two clauses later in the same paragraph.
- **Why it matters:** This section is where an agent looks to decide which file a doc change belongs in; an unlisted file gets its content duplicated into README instead of updated in place. `public/llms.txt` in particular needs an update whenever a section or key URL changes, and nothing in AGENTS.md says so.
- **Fix:** Enumerate the full surface with one line of ownership each, and note that `public/llms.txt` tracks the key-pages list.

### F21 — Advertised section URLs currently 404 on the live site

- **What:** `curl -L` against production: `/blog` → 404, `/newsletter` → 404, `/shop` → 404, while the retired `/guides` → 200. README's intro and license sections plus `public/llms.txt:13-15` all advertise the first three. Cause confirmed as deploy ordering, not a wrong URL: `git ls-tree origin/main` has no `src/app/blog|newsletter|shop`, no `public/llms.txt`, and a root `app/` — this branch is unmerged, and `next.config.ts:12` adds the `/guides` → `/blog` 308 that also isn't live yet.
- **Why it matters:** Low risk because docs and app ship in the same commit — but only if they do. Merging or cherry-picking the doc changes ahead of the app deploy publishes a README and an AI-crawler manifest whose primary links 404. Flagged as **needs confirmation** after deploy.
- **Fix:** Re-run the URL check post-deploy. Keep README/`llms.txt` in the same merge as the route move; don't split them.

### F22 — SECURITY.md cross-reference doesn't land

- **What:** `SECURITY.md:54` lists prompt injection as out of scope "— tool agents' output is schema-validated and prompts are not treated as a secret (see `CONTRIBUTING.md`)". CONTRIBUTING's only prompt section ("Agent prompt changes", line 137) covers where agents live and how to submit prompt PRs; it says nothing about prompts not being secret or outputs being schema-validated. The underlying claims are true (`SeoMetaSchema` / `SocialPostsSchema` gate the outputs), but the pointer goes nowhere.
- **Why it matters:** A researcher checking whether their prompt-injection report is in scope follows the pointer, finds nothing, and files anyway.
- **Fix:** Drop the parenthetical, or add one line to CONTRIBUTING's prompt section stating prompts are public by design and outputs are schema-validated.

### F23 — Two H1s in AGENTS.md

- **What:** `AGENTS.md:3` (`# This is NOT the Next.js you know`, inside the auto-managed block) and `AGENTS.md:9` (`# AGENTS.md — The Productivity Bug`).
- **Why it matters:** Cosmetic; heading hierarchy is otherwise clean and both README and CONTRIBUTING have a single top-level heading. Noting it because the auto-managed block's level is the thing to change, not the document title.
- **Fix:** Demote the managed block's heading to `##` if the generator allows it; otherwise leave and consider this accepted.

## Scorecard

| Category        | Score | Notes                                                                                                                                                                               |
| --------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stale claims    | 6/10  | ~40 documented exports, routes, env vars, quota constants, sitemap and SSRF claims all verified true — but both structure trees are wrong post-move, plus F6–F8                     |
| Links & URLs    | 7/10  | Every internal link and the one anchor (`README.md#environment-variables`) resolves; all 13 external links 200 except the dead Discussions link and the pending-deploy section URLs |
| Navigation      | 9/10  | No docs site, so nav integrity is largely N/A; the six root docs cross-link cleanly and `CLAUDE.md` correctly imports `@AGENTS.md`                                                  |
| Duplication     | 5/10  | Setup block, scripts table, structure tree, and conventions each maintained in 2–3 files, with measurable drift already present                                                     |
| Coverage        | 8/10  | All 9 tools in `TOOLS` documented with accurate taglines and 6 platforms; gaps are `APP_ENV`, `mdx-components.tsx`, the docs inventory                                              |
| Consistency     | 7/10  | One canonical product name and tagline throughout; branch model, Node version, and verify commands disagree across files                                                            |
| README accuracy | 8/10  | Quickstart, badges, license split, and privacy claims all check out against code; env table and the PR template it implies are the gaps                                             |
| Freshness       | 7/10  | Docs were rewritten with the refactor and are mostly current; the structure trees are the one high-churn area that didn't move                                                      |

## Action items

### Fix Now

| #   | Priority | Task (finding ID)                                                                  | Effort |
| --- | -------- | ---------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Repoint both structure trees at `src/app/`, `src/components/`, `src/lib/` (F1, F2) | 15 min |
| 2   | P0       | Replace `pnpm check` in the PR template with the real CI gate set (F4)             | 5 min  |
| 3   | P0       | Add `predicate-quantifier: every` to the `docs-only` paths-filter (F5)             | 5 min  |
| 4   | P1       | Settle the base branch and state it once; link it from the other doc (F3)          | 15 min |

### Next Release

| #   | Priority | Task (finding ID)                                                                           | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------- | ------ |
| 5   | P1       | Correct `<slug>.action.ts` → `<domain>.action.ts` in both docs (F6)                         | 5 min  |
| 6   | P1       | Document the `config/` no-barrel exception and why (F7)                                     | 10 min |
| 7   | P1       | Fix the `src/content/tools/` loading + validation claim, or add the service and schema (F8) | 30 min |
| 8   | P1       | Collapse scripts/verify commands to one source of truth matching CI (F9, F13)               | 30 min |
| 9   | P2       | Add `APP_ENV` to the README env table; soften `GOOGLE_API_KEY`'s Required ✅ (F11)          | 10 min |
| 10  | P2       | Enable Discussions or drop the contact link (F10)                                           | 5 min  |
| 11  | P2       | Rewrite the stale CI env comment (Zod-required claim, Cloudflare → Umami) (F12)             | 5 min  |

### Backlog

| #   | Priority | Task (finding ID)                                                          | Effort |
| --- | -------- | -------------------------------------------------------------------------- | ------ |
| 12  | P3       | Align the Node version statement with `.nvmrc`/CI; add `engines` (F14)     | 10 min |
| 13  | P3       | Fix the JSON-LD escape notation (F15)                                      | 2 min  |
| 14  | P3       | List all six `src/styles/` partials in import order (F16)                  | 5 min  |
| 15  | P3       | Document both Redis key shapes (F17)                                       | 5 min  |
| 16  | P3       | Scope the "never `export *`" rule to `lib/` barrels (F18)                  | 5 min  |
| 17  | P3       | Add `src/mdx-components.tsx` to both trees (F19)                           | 5 min  |
| 18  | P3       | Enumerate the full docs surface in AGENTS.md's Documentation section (F20) | 10 min |
| 19  | P3       | Re-check `/blog`, `/newsletter`, `/shop` after deploy (F21)                | 5 min  |
| 20  | P3       | Fix or drop the SECURITY.md → CONTRIBUTING.md prompt cross-reference (F22) | 5 min  |
| 21  | P3       | Demote the managed block's H1 in AGENTS.md if the generator permits (F23)  | 5 min  |

## Resolved since last audit

First run — nothing to compare against.

## Verified accurate (not findings)

Recorded so a future run doesn't re-litigate them. Every one was checked against code:

- All 40 exported symbols named across AGENTS.md and CONTRIBUTING.md exist with the documented names and locations — `createGeminiClient`, `toTokenUsage`, `resolvePlatformApiKey`, `enforceDailyQuota`, `getHostedQuotaStatus`, `generateSchemaOutputFromArticle`, `resolveArticleSource`, `articleSourceErrorRules`, `assertSafeArticleUrl`, `toUserMessage`, `renderOgImage`, `isBrowser`, `articleSourceIdentity`, `createLocalStore`, `createHistoryStore`, `createWriterStorage`, `useWriter`, `WriterRuntime`, `JsonLdScript`, `namespaced`, `ROUTES`, `TOOLS`, `SITE_NAME`, `SITE_URL`, `SHOP_CANONICAL_BASE`, `BYOK_MODELS`, the four daily-quota constants, the three actions, the three content loaders, `PostFrontmatterSchema`, `SeoMetaSchema`, `PostMeta`, `ArticleSource`, `POST_SLUGS`, `STORAGE_KEYS`, and the error-boundary components.
- `lib/config/` file list in AGENTS.md:48 matches `ls` exactly; so do the `lib/server/utils/` and `lib/utils/` descriptions (including "`cn.ts` is the one bare name").
- Next config claims: `cacheComponents`, `typedRoutes`, `reactCompiler`, `@next/mdx`, and the two 308 `/guides` redirects are all present and permanent.
- `tsconfig.json` provides both documented aliases (`@/*`, `@env`); strict mode on.
- Sitemap description in AGENTS.md:141 matches `src/app/sitemap.ts` line for line, including `status !== "soon"` exclusion and shop products being omitted for the www canonical.
- Rate limiting is production-gated via `isProduction` and fails open; Umami is gated the same way; no `NEXT_PUBLIC_*` var exists anywhere in `src/`.
- All 9 tools in `TOOLS` appear in the README with accurate taglines; the 6 social platforms and the 50–60 / 150–160 SEO character bounds match their constants.
- `.github` inventory in AGENTS.md:177 is exact — the five workflows and dependabot config exist; commitlint, `pr-title.yml`, `CODEOWNERS`, and `stale.yml` are genuinely absent as claimed.
- `labeler.yml` globs were correctly updated to `src/**` during the refactor.
- Husky pre-commit runs `lint-staged` as documented; `src/content/**/_drafts/` and `docs` are gitignored; `.env.example` is committed.
- `public/llms.txt` licensing and key-page claims are accurate; the repo URL is one canonical form (`github.com/Timonwa/tools-by-timonwa`) everywhere and matches `origin`.
