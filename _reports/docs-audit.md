# Docs audit — The Productivity Bug (root documentation surface)

**Date:** 2026-08-18 · **Phase:** production · **Mode:** fixes applied · **Branch:** `code-restructuring` · **Scope:** `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, `SECURITY.md`, `TRADEMARK.md`, `LICENSE`, `LICENSE-content`, `.github/**` templates + workflow doc-logic, `public/llms.txt`, `_reports/**` — verified against `src/**`, `package.json`, `next.config.ts`, `pnpm-workspace.yaml`, the env schema, and the live site. The gitignored `docs/` folder was excluded. · **Overall:** 9/10

## Score change (previous → current)

| Metric  | Previous | Audit found | After fixes | Δ vs previous | Trend |
| ------- | -------- | ----------- | ----------- | ------------- | ----- |
| Overall | 7/10     | 5/10        | 9/10        | +2            | ▲     |

**The audit found 5/10 because the code moved and the docs didn't** — ten fix passes landed between the two runs (rate limiting rewritten, Redis given a client layer, the model id taken out of the environment, a route group added, a CSP introduced) while AGENTS.md and README.md still described the pre-pass app. Sixteen new findings, four of them HIGH, all the same shape: a doc that was true last run and false now. That is the expected cost of a fix-first, docs-last sequence, and the reason this audit ran last.

**32 of 35 are now fixed.** Of the three that aren't: F23 is accepted (the H1 sits inside an auto-managed block that AGENTS.md says to leave intact, and the generator isn't ours to change), F21 needs the branch deployed before it can be re-checked, and F38 is a copy decision waiting on the maintainer.

Two fixes went beyond editing prose, because a doc claim is only worth making true:

- **F8** — the claim that all four content directories are loaded and validated was false, and the audit's own premise for fixing it was too: `content/tools/*.mdx` has no frontmatter at all (each file exports a `faq` const), so `createMdxLoader` was never applicable. What was genuinely missing were the two checks the other types get for free, so `assertToolSlug` and `parseToolFaq` now supply them. Shipped in its own commit.
- **F36** — rather than documenting an exception, `lib/config/index.ts` now lists `site.ts`'s 27 exports explicitly, leaving `components/ui/index.ts` as the repo's only `export *` and the rule true as written.

## Findings

| ID  | Severity | Category        | Status    | Issue                                                                                           | Location                               |
| --- | -------- | --------------- | --------- | ----------------------------------------------------------------------------------------------- | -------------------------------------- |
| 24  | HIGH     | Stale claims    | **FIXED** | `IP_HASH_SECRET` documented optional; production **throws at boot** without it                  | `README.md:71` / `AGENTS.md:181`       |
| 27  | HIGH     | Stale claims    | **FIXED** | Rate limiting documented "production only, fails open" — it follows Upstash creds, fails closed | `AGENTS.md:159` / `AGENTS.md:244`      |
| 26  | HIGH     | Stale claims    | **FIXED** | `LLM_MODEL` documented as a settable var in 3 places; the name exists nowhere in the code       | `README.md:69` / `AGENTS.md:183,243`   |
| 25  | HIGH     | Stale claims    | **FIXED** | `GOOGLE_API_KEY` alone no longer enables the AI tools — unmetered builds refuse to serve        | `README.md:74` / `AGENTS.md:181`       |
| 1   | HIGH     | Stale claims    | **FIXED** | Repository-structure tree puts the App Router at root `app/`; it lives at `src/app/`            | `AGENTS.md:38`                         |
| 2   | HIGH     | Stale claims    | **FIXED** | Codebase-layout tree shows `app/`, `components/`, `lib/` at repo root; all three are `src/*`    | `CONTRIBUTING.md:73,82,98`             |
| 3   | HIGH     | Stale claims    | **FIXED** | Branch model contradicts itself: PRs target `dev` (AGENTS) vs `main` (CONTRIBUTING)             | `AGENTS.md:92` / `CONTRIBUTING.md:147` |
| 4   | HIGH     | README accuracy | **FIXED** | PR checklist requires `pnpm check`, a script that does not exist                                | `.github/pull_request_template.md:15`  |
| 28  | MEDIUM   | Stale claims    | **FIXED** | Redis key format wrong on both counts, and the burst tier is undocumented                       | `AGENTS.md:165`                        |
| 39  | MEDIUM   | Stale claims    | **FIXED** | "action inputs in the action files" — they live in `lib/schemas/` now                           | `AGENTS.md:19`                         |
| 29  | MEDIUM   | Coverage        | **FIXED** | The `(hub)` route group is in neither structure tree nor the Routing section                    | `AGENTS.md:38` / `CONTRIBUTING.md:73`  |
| 30  | MEDIUM   | Stale claims    | **FIXED** | `clients/` documented as `<service>.client.ts` singletons; `clients/redis/` is a 4-file folder  | `AGENTS.md:60`                         |
| 31  | MEDIUM   | Stale claims    | **FIXED** | `pnpm-workspace.yaml` described as one postcss pin; it holds 3 overrides + `allowBuilds`        | `AGENTS.md:173,245`                    |
| 32  | MEDIUM   | Coverage        | **FIXED** | The CSP and five other security headers are documented nowhere                                  | `AGENTS.md:155` / `next.config.ts:77`  |
| 33  | MEDIUM   | Coverage        | **FIXED** | Newsletter metering, burst caps, and the honeypot are absent from the backend docs              | `AGENTS.md:153,165`                    |
| 34  | MEDIUM   | Coverage        | **FIXED** | `parseActionInput` — mandatory at every action boundary — is in no reuse list                   | `AGENTS.md:70` / `CONTRIBUTING.md:121` |
| 6   | MEDIUM   | Stale claims    | **FIXED** | Action filename documented as `<slug>.action.ts`; real convention is `<domain>.action.ts`       | `AGENTS.md:30` / `CONTRIBUTING.md:121` |
| 8   | MEDIUM   | Stale claims    | **FIXED** | `src/content/tools/` is not loaded by a service or validated by Zod, as documented              | `AGENTS.md:169`                        |
| 9   | MEDIUM   | Duplication     | **FIXED** | Scripts/verify commands maintained in 3 docs with 4 different command sets                      | `README.md:78` / `CONTRIBUTING.md:57`  |
| 10  | MEDIUM   | Links & URLs    | **FIXED** | Issue-chooser links GitHub Discussions; Discussions is disabled on the repo                     | `.github/ISSUE_TEMPLATE/config.yml:4`  |
| 11  | MEDIUM   | Coverage        | **FIXED** | README env table omits `APP_ENV` and mislabels `GOOGLE_API_KEY` as required                     | `README.md:64`                         |
| 36  | LOW      | Consistency     | **FIXED** | `lib/config/index.ts` uses `export *` — inside `lib/`, where both docs forbid it                | `src/lib/config/index.ts:20`           |
| 37  | LOW      | Links & URLs    | **FIXED** | `llms.txt` promotes `/shop` as a key page after the section canonicalized away                  | `public/llms.txt:15`                   |
| 38  | LOW      | Consistency     | OPEN      | Four different taglines across README, `llms.txt`, `SITE_TAGLINE`, `SITE_DESCRIPTION`           | `README.md:3` / `public/llms.txt:3`    |
| 35  | LOW      | Coverage        | **FIXED** | `_reports/` is committed but absent from the Documentation section                              | `AGENTS.md:239`                        |
| 13  | LOW      | Duplication     | **FIXED** | Whole dev-setup block duplicated verbatim in README and CONTRIBUTING                            | `README.md:48` / `CONTRIBUTING.md:41`  |
| 14  | LOW      | Consistency     | **FIXED** | Node requirement stated as 20.9+; `.nvmrc` pins 22 and nothing is enforced                      | `README.md:50` / `CONTRIBUTING.md:43`  |
| 15  | LOW      | Stale claims    | **FIXED** | JSON-LD escape claim is still a no-op — `` `<` `` → `` `<` ``                                   | `AGENTS.md:160`                        |
| 16  | LOW      | Stale claims    | **FIXED** | `src/styles/` described as tokens/theme/base only; three more partials exist                    | `AGENTS.md:41,117`                     |
| 18  | LOW      | Stale claims    | **FIXED** | "never `export *`" stated without noting `src/components/ui/index.ts` does exactly that         | `AGENTS.md:47`                         |
| 19  | LOW      | Coverage        | **FIXED** | Neither structure tree lists `src/mdx-components.tsx`, required by the MDX setup                | `AGENTS.md:38` / `CONTRIBUTING.md:73`  |
| 20  | LOW      | Coverage        | **FIXED** | Documentation inventory omits SECURITY/TRADEMARK/`.github` templates/`public/llms.txt`          | `AGENTS.md:239`                        |
| 21  | LOW      | Links & URLs    | DEFERRED  | `/blog`, `/newsletter`, `/shop`, `/llms.txt` still 404 on the live site (unmerged branch)       | `README.md:14` / `public/llms.txt:13`  |
| 22  | LOW      | Consistency     | **FIXED** | SECURITY.md cites CONTRIBUTING.md for a statement CONTRIBUTING.md doesn't make                  | `SECURITY.md:54`                       |
| 23  | LOW      | Consistency     | ACCEPTED  | Two `# ` H1s in one file                                                                        | `AGENTS.md:3,9`                        |

### F24 — `IP_HASH_SECRET` is documented optional and is a hard boot failure

- **What:** `README.md:71` gives it `—` in the Required column, and `AGENTS.md:181` opens the secrets paragraph with "all optional — features degrade gracefully when unset". Neither is true since the redis pass. `src/lib/server/utils/rate-limit.utils.ts:55-59` runs at module load: `if (isProduction && !env.IP_HASH_SECRET) throw new Error(...)`. It is a module-scope throw in a file every AI action imports, so with `APP_ENV=production` and no `IP_HASH_SECRET` the app does not boot — nothing degrades.
- **Why it matters:** This is the worst kind of doc defect: the docs promise graceful degradation and the code hard-fails. Someone self-hosting from the README sets `APP_ENV=production` (which `AGENTS.md:177` tells them to do on deploy), doesn't set a var the table says is optional, and their deploy crashes at startup with no hint from either document. The throw is correct — an unkeyed IP hash is brute-forceable — so the code is right and the docs are wrong.
- **Fix:** Mark it "Required when `APP_ENV=production`" in the README table with the `openssl rand -hex 32` hint the error message already gives, and replace AGENTS.md's "all optional" with "all optional except `IP_HASH_SECRET`, which is required in production".

### F27 — Rate limiting is documented with the opposite failure mode

- **What:** `AGENTS.md:159` says "production only, fails open". Both halves are now false. **Activation:** `rate-limit.utils.ts:42` sets `isDevServer = process.env.NODE_ENV === "development"` and `canServeHostedAi()` returns `isDevServer || hasRedisCredentials()` — metering follows the Upstash credentials, not `APP_ENV`, so any built deploy meters (previews included). **Failure mode:** `rate-limit.utils.ts:172-179` fails **closed** — "Both paths failed, so Redis itself is unreachable: fail CLOSED". `AGENTS.md:244`'s troubleshooting entry repeats the stale rule: "it only activates with `APP_ENV=production` + Upstash vars set".
- **Why it matters:** Fail-open versus fail-closed is the single most important property of a cost control, and the doc states it backwards. An agent or contributor reasoning about spend risk from AGENTS.md reaches the exact wrong conclusion, and someone debugging a 429 storm will chase `APP_ENV` when the answer is Redis reachability. The whole point of the environment pass was to invert this behaviour; the doc still describes the bug that was fixed.
- **Fix:** "Metering follows the Upstash credentials, not the tier — the dev server is exempt, every built deploy meters, and an unreachable Redis **denies** hosted generations (`canServeHostedAi`). BYOK requests skip it." Update the troubleshooting entry to match.

### F26 — `LLM_MODEL` is documented three times and exists nowhere

- **What:** `README.md:69` lists it as an env var ("Server model (default `gemini-flash-lite-latest`)"), `AGENTS.md:183` calls it a per-tier constant, and `AGENTS.md:243`'s troubleshooting says "use a `-latest` alias in `LLM_MODEL`". `grep -rn "LLM_MODEL" src/` returns only `HOSTED_LLM_MODEL`, a committed constant in `src/lib/config/byok.ts:13`, whose own comment says why: "Committed rather than env-held: a model id isn't a secret, and holding it in env let staging and production drift onto different models with no review and no allowlist check." It is not read from `process.env` anywhere, and it is absent from the `EnvSchema`.
- **Why it matters:** Setting `LLM_MODEL` in a deploy does nothing at all, silently — the most confusing failure shape there is, because the variable name looks canonical and appears in the official env table. The troubleshooting entry actively misdirects: it is the documented remedy for a live 404 from Gemini, and following it changes nothing while the outage continues.
- **Fix:** Drop the README row and point the troubleshooting entry at `HOSTED_LLM_MODEL` in `lib/config/byok.ts`, noting the allowlist (`ByokModel`) that constrains it.

### F25 — `GOOGLE_API_KEY` is no longer sufficient to run the AI tools

- **What:** `README.md:74` says "the AI tools need `GOOGLE_API_KEY` (or a user's own key)" and `.env.example`'s quickstart comment says "add at least `GOOGLE_API_KEY`". Since the environment pass a platform key is necessary but not sufficient: `canServeHostedAi()` (`rate-limit.utils.ts:45`) returns false in any built app without Upstash credentials, and hosted generations are refused rather than served unmetered. `rate-limit.utils.ts:63-68` logs exactly this at boot: "A platform Gemini key is configured but Upstash credentials are not, so hosted generations cannot be metered and will be refused."
- **Why it matters:** A self-hoster follows the README, sets one key, builds, and finds every AI tool refusing hosted runs with no documented explanation — while the boot log explains it perfectly. The design is deliberate and good (never spend an unmetered key); it is just undocumented, which converts a safety feature into an apparent bug.
- **Fix:** One line under the env table: hosted AI needs `GOOGLE_API_KEY` **and** the two Upstash vars, because a build that cannot meter refuses to spend the platform key; BYOK works with neither. Note that the dev server is exempt.

### F1 — AGENTS.md structure tree puts the App Router at root `app/`

- **What:** Unchanged from the previous run. `AGENTS.md:38` opens the tree with a bare `app/` while every sibling carries `src/` (`src/styles/`, `src/components/`, `src/lib/`, `src/content/`). There is no root `app/`; `ls src` returns `app components content lib mdx-components.tsx styles`.
- **Why it matters:** It is the paragraph an agent reads before creating a route, and a file created at `app/<slug>/page.tsx` is not routed by Next at all. The intra-block inconsistency makes it read as deliberate.
- **Fix:** Change the tree root to `src/app/`. Do it in the same pass as F29, which rewrites the same lines.

### F2 — CONTRIBUTING.md codebase-layout tree is unprefixed for three top-level dirs

- **What:** Unchanged. `CONTRIBUTING.md:73` (`app/`), `:82` (`components/`), `:98` (`lib/`) sit at the root while only `src/styles/` (`:81`) carries the prefix.
- **Why it matters:** This is the onboarding map for external contributors, and both README and AGENTS.md point at it. It also disagrees with AGENTS.md, which uses `src/components/` and `src/lib/` — so a contributor comparing the two gets two layouts.
- **Fix:** Prefix all four entries with `src/`, and make the "Anatomy of a tool" paths consistent with whichever convention you pick — they are bare too.

### F3 — The two docs give contributors different base branches

- **What:** Unchanged. `AGENTS.md:92` says feature PRs target `dev`; `CONTRIBUTING.md:147` says branch from `main` and `:158` says open the PR against `main`. Both branches exist, so neither instruction fails loudly.
- **Why it matters:** Every external contribution follows CONTRIBUTING and every agent-assisted change follows AGENTS, so the two audiences are routed to different branches. **This one has become live rather than theoretical:** this session created `dev`, merged PR #22 into it, and branched `code-restructuring` from it — so `dev` is now genuinely the integration branch and CONTRIBUTING is the stale document.
- **Fix:** State the model once in CONTRIBUTING (`dev` is the integration branch; PRs target `dev`) and have AGENTS.md link it rather than restate it.

### F4 — PR template requires a script that doesn't exist

- **What:** Unchanged. `.github/pull_request_template.md:15` reads "`pnpm check` and `pnpm typecheck` pass". The scripts are exactly `dev build start lint typecheck format format:check prepare` — no `check`.
- **Why it matters:** It is the last thing a contributor reads before submitting, and the command is unrunnable. The two gates CI enforces beyond typecheck — `pnpm lint` and `pnpm format:check` — aren't named, so ticking the box still yields red CI on formatting.
- **Fix:** Replace with the real CI set: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm build`. Fold into F9's single-source-of-truth pass.

### F28 — The Redis key format is now wrong on both counts, and a whole tier is missing

- **What:** `AGENTS.md:165` documents "`ratelimit:<toolSlug>:user|pool:<date>`". The redis pass moved every key into `src/lib/server/clients/redis/keys.ts`, which builds them as `rl:<APP_ENV>:<toolSlug>:user:<clientHash>:<date>`, `rl:<APP_ENV>:<toolSlug>:pool:<date>`, and `rl:<APP_ENV>:<toolSlug>:burst:<clientHash>:<windowStart>`. So the prefix changed (`ratelimit` → `rl`), a tier scope was added (one Upstash database serves every environment), the user key's hash segment is still missing as it was in the last run, and the **burst tier doesn't appear in the docs at all**.
- **Why it matters:** The key shape is what you would use to inspect or purge counters against a live Redis, and the documented pattern now matches nothing. The burst ceiling is also a user-visible refusal reason (`reason: "burst"`), so support-debugging a rejected request from the docs alone is impossible.
- **Fix:** Document all three shapes with the `rl:<APP_ENV>` scope and say why the tier is in the key (one database, many environments — a preview must not spend production's pool). Point at `keys.ts` as the one file where the keyspace lives.

### F39 — Action-input schemas are documented as living in the action files

- **What:** `AGENTS.md:19` states "Validation: Zod — content frontmatter in `lib/schemas/`, env in `lib/config/env.ts`, **action inputs in the action files**", and `AGENTS.md:163` repeats "Inputs validated with Zod in the action". The security pass moved them: `src/lib/schemas/` now holds `shared.schema.ts`, `seo-meta.schema.ts`, and `social-posts.schema.ts` alongside the three content schemas, and the actions call `parseActionInput(SomeSchema, input)`.
- **Why it matters:** The `schemas/` bullet three lines down says the folder owns "content frontmatter" specifically, so an agent adding a tool follows the documented split and declares a new input schema inline in the action — diverging from all three existing actions on the single most security-relevant convention in the repo.
- **Fix:** Say action-input schemas live in `lib/schemas/<domain>.schema.ts` beside the content ones and are applied via `parseActionInput` at the top of the action.

### F29 — The `(hub)` route group is undocumented

- **What:** `src/app/` contains `(hub)/` holding `page.tsx`, `layout.tsx`, `blog/`, `newsletter/`, `shop/`, `categories/`, and `tools/`. Neither tree shows it: `AGENTS.md:38-40` lists `(tools)/<slug>/` and then `blog/ newsletter/ shop/` as plain siblings, and `CONTRIBUTING.md:74` puts `layout.tsx page.tsx` at the `app/` root as "hub shell + landing". `AGENTS.md:121`'s Routing section names `(tools)` as the only route group and describes the content sections as "plain segments".
- **Why it matters:** The group exists to render `HubNavbar` once for every hub page, so a new content section created outside it silently loses the navbar — a defect that looks like a styling bug and is actually a file-placement one. Two route groups with different purposes and only one documented is exactly the shape that produces that mistake.
- **Fix:** Add `(hub)/` to both trees with its purpose (shared navbar layout for home, tools, categories, and the content sections) and mention both groups in the Routing section, contrasting grouping-only `(tools)` with layout-bearing `(hub)`.

### F30 — `clients/` is documented as flat single files

- **What:** `AGENTS.md:60` describes `lib/server/clients/` as "`<service>.client.ts` — configured SDK singletons (gemini)", and `CONTRIBUTING.md:113` says the same. The redis pass added `clients/redis/` as a four-file folder — `client.ts` (pooled client with auto-pipelining), `keys.ts`, `ttl.ts`, `index.ts` — none of which matches the `<service>.client.ts` pattern.
- **Why it matters:** The naming convention as documented would have the Redis client at `redis.client.ts`, so an agent will either "correct" the folder or add a second, conflicting client file. The `keys.ts`/`ttl.ts` split also encodes two real rules — every key is built in one file, every key gets a TTL — that no document states, so a new key written inline breaks both invisibly.
- **Fix:** Document the folder form (`clients/<service>/` when a client needs more than a singleton) and carry the two invariants into the Backend section: keys only from `REDIS_KEYS`, TTLs only from `ttl.ts`.

### F31 — The `pnpm-workspace.yaml` description is a third of the file

- **What:** `AGENTS.md:173` says it "exists only to pin `postcss >= 8.5.10` against a vulnerability Next still transitively pins", and `:245`'s troubleshooting repeats the 8.5.10 figure. Actual: the floor is `>=8.5.23` (three advisories, not one), plus `js-yaml: ">=3.15.1 <4"` — whose `<4` ceiling is load-bearing, because js-yaml 4 dropped the `safeLoad` that `gray-matter` calls and forcing 4.x breaks frontmatter parsing at build — plus `sharp: ">=0.35.0"` for four libvips CVEs, an `allowBuilds` allowlist (`sharp`, `unrs-resolver`), and a comment recording `brace-expansion` as a deliberate non-override because pinning it breaks `pnpm lint`.
- **Why it matters:** "Exists only to pin postcss" invites someone to delete or simplify the file, which would silently reintroduce four advisories and — via the js-yaml ceiling — break the build in a way whose cause is two dependency hops away from the symptom. The stale 8.5.10 also makes the documented floor look satisfied when a newer advisory sits above it.
- **Fix:** Describe it as the repo's dependency-security control surface, note that every floor carries its advisory IDs inline, and flag the js-yaml ceiling and the `brace-expansion` exception as decisions with reasons in the file. Drop the specific version number from AGENTS.md so it cannot drift again — point at the file.

### F32 — The CSP and the security headers are documented nowhere

- **What:** `next.config.ts:77` serves `SECURITY_HEADERS` on `/:path*`, including a `Content-Security-Policy` (`:31`) and a `Permissions-Policy` (`:39`). The Security section of AGENTS.md (`:155-161`) covers BYOK storage, SSRF, rate limiting, JSON-LD escaping, and secrets — and never mentions headers. Neither does README, CONTRIBUTING, or SECURITY.md. SECURITY.md's out-of-scope list still says "Missing best-practice HTTP headers that have no concrete impact", written when there were none.
- **Why it matters:** A CSP is the security control most likely to be broken by ordinary feature work — one inline script, one new third-party embed, one analytics swap — and the failure appears in the browser console, far from `next.config.ts`. Nothing in the docs tells a contributor the policy exists, let alone that adding a script domain means editing it. It is also the repo's main defense-in-depth story and is missing from the one file a reviewer reads to assess posture.
- **Fix:** Add a Security bullet naming the header set and the CSP's location, with the one operational rule: a new external script, font, or frame source requires a CSP edit in the same PR.

### F33 — Newsletter metering, burst caps, and the honeypot are missing from the backend docs

- **What:** `AGENTS.md:165` lists the hosted quota budgets as exactly four constants (`SEO_META_*`, `SOCIAL_POST_*`). `src/lib/constants/newsletter.constant.ts` adds `NEWSLETTER_DAILY_USER_CAP`, `NEWSLETTER_DAILY_SHARED_POOL`, and `NEWSLETTER_BURST_CAP`, all consumed by `newsletter.action.ts:56-58`; `NEWSLETTER_HONEYPOT_FIELD` gates the form (`:38`). `AGENTS.md:153` also still says "The only gating is the hosted daily quota", which now understates it — there is a burst tier on every metered action and a bot trap on the newsletter form.
- **Why it matters:** The newsletter action writes to Sender.net with a server token, so its metering is a spend-and-abuse control equal in importance to the AI quotas; a doc listing only the AI caps implies the newsletter is unmetered and invites someone to "add" the protection that already exists, or to remove the honeypot field as dead markup.
- **Fix:** List all seven quota constants, add the burst tier to the description, and note the honeypot as a deliberate hidden field that must not be removed or made visible.

### F34 — `parseActionInput` is mandatory and appears in no reuse list

- **What:** `AGENTS.md:70` enumerates the shared server layer (`resolvePlatformApiKey`, `enforceDailyQuota`, `generateSchemaOutputFromArticle`, `resolveArticleSource`, `toUserMessage`) and `CONTRIBUTING.md:121-126` gives the same list as build-a-tool step 3. Neither names `parseActionInput` (`utils/ai/action-input.utils.ts:17`), which every action now calls first and which throws the coded `INVALID_INPUT` the UI depends on. Also absent: `assertSafeArticleUrl` (the SSRF guard, named in the Security section but not the reuse list), `withResolvedArticleUrl`, and `canServeHostedAi`.
- **Why it matters:** These lists are the "before you add plumbing, check here" surface, and the one helper that is non-optional is the one missing from them. An agent writing a new AI action follows the list, validates ad hoc or not at all, and reintroduces the unvalidated-input finding the security pass closed.
- **Fix:** Add `parseActionInput` at the top of both lists, marked as required at every action boundary rather than merely available, and add the three other missing helpers.

### F6 — Action files are documented as `<slug>.action.ts`

- **What:** Unchanged. `AGENTS.md:30` and `CONTRIBUTING.md:121` name the file after the tool slug; the real files are `seo-meta.action.ts` and `social-posts.action.ts` against slugs `article-to-seo-meta` and `article-to-social-posts`. `AGENTS.md:57` states the correct `<domain>.action.ts` convention, so AGENTS.md contradicts itself.
- **Why it matters:** An agent following the "What this is" section names the file `article-to-<x>.action.ts` and breaks the convention the same document enforces elsewhere.
- **Fix:** Use `<domain>.action.ts` / `<domain>.service.ts` in all three places, noting the domain is the short name (`seo-meta`), not the route slug.

### F8 — `src/content/tools/` isn't loaded or validated the way the docs claim

- **What:** Unchanged. `AGENTS.md:169` says all four content dirs — including `tools/` — are loaded through `create-mdx-loader.utils.ts` with a slug allowlist and build-time frontmatter validation. The nine `src/content/tools/*.mdx` files are pulled in by a dynamic import in a component (`ToolContent.tsx:11`, `await import(\`@/content/tools/${currentSlug}.mdx\`)`), with no service, no allowlist, and no schema — `src/lib/schemas/` holds no tool-content schema.
- **Why it matters:** It overstates the validation surface, so an input-handling reviewer concludes all MDX frontmatter is schema-checked when a quarter of it isn't, and it is the one MDX read not behind the documented `^[a-z0-9-]+$` allowlist.
- **Fix:** Document the exception, or bring `tools/` under a service and schema so the documented rule becomes true.

### F9 — Scripts and verify commands live in three docs with four different command sets

- **What:** Unchanged and still drifted. `README.md:78` lists 5 of 7 scripts (omits `start`, `format:check`); `CONTRIBUTING.md:57` lists 6 (omits `typecheck`) and then `:66` tells readers to run `pnpm exec tsc --noEmit` even though `typecheck` exists; `AGENTS.md:78` has all 7. Verify sets: AGENTS says `typecheck && lint && build` in two places and `lint && typecheck && format:check` in a third; CONTRIBUTING `:152` says `lint` + `tsc --noEmit`; the PR template says `check` + `typecheck` (F4). CI runs `lint`, `format:check`, `typecheck`, `build`.
- **Why it matters:** Four sources for one list guarantees the drift already present, and none of the four matches what CI gates — so a contributor can follow any of them faithfully and still fail the pipeline.
- **Fix:** Keep the full table in CONTRIBUTING, have README and AGENTS link it, and make every "verify" instruction the exact CI set.

### F10 — Issue chooser links a disabled Discussions tab

- **What:** Unchanged. `.github/ISSUE_TEMPLATE/config.yml:4` points "Ask a Question" at `/discussions`; the repo has `has_discussions: false`.
- **Why it matters:** First thing shown to anyone opening an issue, routing questions to a dead end — compounded by `CONTRIBUTING.md:16` sending questions to the chooser.
- **Fix:** Enable Discussions, or drop the contact link and point at the blank-issue path.

### F11 — README env table omits `APP_ENV` and overstates `GOOGLE_API_KEY`

- **What:** Unchanged, and now compounded by F24 and F25 in the same table. `APP_ENV` is still absent though it gates rate limiting and analytics and `AGENTS.md:177` says to set it explicitly on deploy; `GOOGLE_API_KEY` still shows "Required ✅" against `secret()` (optional) in the schema and the README's own note two lines below.
- **Why it matters:** Someone self-hosting from this table deploys with analytics off and — per F24 — possibly a crash. Four separate defects in one nine-row table make it the least trustworthy thing in the docs.
- **Fix:** Rebuild the table in one edit covering F11, F24, F25, and F26 together.

### F36 — `lib/config/index.ts` uses `export *`, the thing both docs forbid

- **What:** The previous run's F7 (no `config/` barrel) is **resolved** — `src/lib/config/index.ts` now exists, and its header comment correctly explains why `env.ts` is excluded. But `:20` is `export * from "./site"`, while `AGENTS.md:47` says `lib/` barrels use "one explicit export line per file (never export \*)" and `CONTRIBUTING.md:115` says "no `export *` from a directory". The previous F18 noted `components/ui/index.ts` as the only violation, and read as an intentionally scoped exception; there are now two, one of them inside `lib/`, where the rule is unambiguous.
- **Why it matters:** A rule with undocumented exceptions in both of the places it is stated stops functioning as a rule. `site.ts` is also the module whose exports changed most this session (`SITE_TITLE`, `SHOP_CANONICAL_BASE`), so the wildcard hides exactly the surface a reviewer would want listed.
- **Fix:** Either list `site.ts`'s exports explicitly (consistent with the file's six siblings) or document the exception and why. Fold the wording fix into F18.

### F37 — `llms.txt` promotes a section that canonicalizes away

- **What:** `public/llms.txt:15` lists "Shop: https://tools.timonwa.com/shop" under "Key pages". The SEO pass established that this section duplicates `www.timonwa.com/shop`: `/shop` and every product now canonicalize to `SHOP_CANONICAL_BASE`, and the section was removed from `sitemap.ts` because sitemapping a page whose canonical points elsewhere asks a crawler to index what we've told it to ignore. Pointing AI crawlers at it does the same thing in a different manifest.
- **Why it matters:** Small, but it is the same contradiction the SEO pass just spent a finding resolving, reintroduced in the file nobody thought to update. `llms.txt:9` also advertises `/shop` product copy under the content licence, which is fine, but the canonical listing should follow the sitemap decision.
- **Fix:** Point the shop entry at `www.timonwa.com/shop`, matching the canonical. Add `public/llms.txt` to the "update when a section or key URL changes" note that F20 asks for.

### F38 — Four different taglines

- **What:** `README.md:3` — "Free, focused tools that skip the busywork of writing and code — for writers, developers, and creators."; `public/llms.txt:3` — "Free, focused web tools for writers, developers, and creators — plus a blog, newsletter archive, and digital-product shop."; `SITE_TAGLINE` — "Free, focused productivity tools for writers, developers, and creators."; `SITE_DESCRIPTION` — "Free, focused web tools for the busywork of writing and code — …". All four share a voice and none matches another.
- **Why it matters:** Cosmetic, and partly legitimate — `SITE_TAGLINE` exists precisely because `SITE_DESCRIPTION` is too long for the footer, and a README hero line reasonably differs from a meta description. Flagged because the checklist asks for one canonical tagline and because these drifted independently rather than by design. **This is copy, so it is the maintainer's call, not a fix to apply** — the SEO pass already established that measuring and presenting beats editing brand lines to satisfy a rule.
- **Fix:** Decide whether one canonical short tagline should feed README and `llms.txt` from `SITE_TAGLINE`'s wording, or accept the variants as per-surface copy and record that in the Brand section so a future audit doesn't re-raise it.

### F35 — `_reports/` is committed and undocumented

- **What:** `AGENTS.md:239` describes the documentation surface as "README.md (user-facing) + CONTRIBUTING.md" plus the licensing files, and notes that `docs/` is private and gitignored. `git ls-files _reports` returns twelve tracked audit reports; `.gitignore` covers `docs` but not `_reports`. So the repo's largest documentation artifact by volume is committed, public, and unmentioned.
- **Why it matters:** An agent asked to run an audit has no documented home for the output and no signal that these are committed rather than scratch. It also matters for a public repo: twelve reports enumerating the app's security controls and past weaknesses are visible to anyone, which is a deliberate choice worth stating rather than discovering.
- **Fix:** Add `_reports/` to the Documentation section — what it holds, that it is tracked deliberately, and that a fix pass updates the report in the same commit as the fix. Fold into F20's inventory.

### F13 — Dev-setup block duplicated verbatim

- **What:** Unchanged. `README.md:48-58` and `CONTRIBUTING.md:41-51` carry byte-identical prerequisites and clone/install/env/dev blocks. Both are correct today.
- **Why it matters:** Not broken, but it is the drift vector that produced F9 and F14 — two copies of one fact aging at different rates.
- **Fix:** Keep the quickstart in README and have CONTRIBUTING link `README.md#run-locally`, as it already links `README.md#environment-variables`.

### F14 — Node requirement doesn't match what the repo uses

- **What:** Unchanged. Both docs state "Node.js 20.9+"; `.nvmrc` pins `22`, the setup action sets `node-version: "22"`, and `package.json` has no `engines` field.
- **Why it matters:** A contributor on Node 20 develops against a runtime CI never exercises, with no machine-readable guard either way.
- **Fix:** State "Node.js 22 (see `.nvmrc`)" in both docs, and add `"engines": { "node": ">=20.9" }` if 20.9 is genuinely still supported.

### F15 — JSON-LD escaping claim is still a no-op

- **What:** Unchanged. `AGENTS.md:160` reads "escaped via `JsonLdScript` (`` `<` `` → `` `<` ``)" — both sides of the arrow are the same character. The code escapes to `<`.
- **Why it matters:** The bullet describes an identity transform, so the mitigation reads as pointless, and an agent "restoring" the documented behaviour would remove the real escape.
- **Fix:** Escape the backslash for Markdown so the arrow's right side renders as `<`.

### F16 — `src/styles/` partial list is incomplete

- **What:** Unchanged. `AGENTS.md:41` and `:117` name tokens/theme/base; `ls src/styles` shows `animations.css`, `base.css`, `components.css`, `globals.css`, `theme.css`, `tokens.css`, `utilities.css`.
- **Why it matters:** An agent adding a component class has no idea `components.css` exists and will inline the styles or create a new file.
- **Fix:** List all six partials in import order in both places.

### F18 — "never `export *`" doesn't note where it's used

- **What:** Unchanged, and now understated — see F36. `src/components/ui/index.ts:4-7` is four `export *` lines, and `lib/config/index.ts:20` adds a fifth inside `lib/`.
- **Why it matters:** The nearest reading of the rule is repo-wide, so an agent will either expand the `ui/` barrel into ~30 lines or treat the rule as advisory.
- **Fix:** Scope it explicitly — `lib/` kind barrels list one export line per file (F36 brings `config/` into line); the `ui/` root barrel re-exports its four tier barrels with `export *`.

### F19 — `src/mdx-components.tsx` is in neither structure tree

- **What:** Unchanged. The file `@next/mdx` requires sits at `src/` root and appears in neither tree, though both enumerate `src/`-level entries and both docs treat MDX as core.
- **Why it matters:** An agent asked to restyle MDX output has no pointer to the file that owns it and will reach for the content components instead.
- **Fix:** Add it to both trees with a one-line note. Same edit as F1, F2, and F29.

### F20 — Documentation inventory undercounts the docs surface

- **What:** Unchanged, and now short by one more (F35). `AGENTS.md:239` omits `SECURITY.md`, `TRADEMARK.md`, `public/llms.txt`, the `.github/` templates, and `_reports/` — and names TRADEMARK.md two clauses later in the same paragraph.
- **Why it matters:** This is where an agent looks to decide which file a doc change belongs in; an unlisted file gets its content duplicated into README instead of updated in place. `public/llms.txt` in particular needs updating whenever a section or key URL changes (see F37), and nothing says so.
- **Fix:** Enumerate the full surface with one line of ownership each, including the `llms.txt` maintenance rule.

### F21 — Advertised section URLs still 404 on the live site

- **What:** Re-verified 2026-08-18: `/` → 200, `/blog` → 404, `/newsletter` → 404, `/shop` → 404, `/llms.txt` → 404, retired `/guides` → 200. Cause is unchanged and confirmed: this branch is unmerged and `origin/main` still holds the pre-rebrand build.
- **Why it matters:** Low risk **only if** docs and app ship together. Merging or cherry-picking doc changes ahead of the app deploy publishes a README and an AI-crawler manifest whose primary links 404. Still **needs confirmation** after deploy.
- **Fix:** Keep README, `llms.txt`, and the route move in one merge. Re-run the URL check post-deploy.

### F22 — SECURITY.md cross-reference doesn't land

- **What:** Unchanged. `SECURITY.md:54` sends readers to CONTRIBUTING.md for the claim that prompts aren't secret and outputs are schema-validated; CONTRIBUTING's prompt section (`:137`) covers only where agents live and how to submit prompt PRs. The underlying claims are true.
- **Why it matters:** A researcher checking whether their prompt-injection report is in scope follows the pointer, finds nothing, and files anyway.
- **Fix:** Drop the parenthetical, or add one line to CONTRIBUTING's prompt section stating prompts are public by design and outputs schema-validated.

### F23 — Two H1s in AGENTS.md

- **What:** Unchanged. `AGENTS.md:3` (inside the auto-managed block) and `:9` (the document title).
- **Why it matters:** Cosmetic; the rest of the hierarchy is clean.
- **Fix:** Demote the managed block's heading to `##` if the generator allows it; otherwise accept it and record that.

## Scorecard

| Category        | Score | Δ   | Notes                                                                                                                                                                                |
| --------------- | ----- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Stale claims    | 9/10  | +3  | Every false behavioural claim corrected: the two inverted security properties, the dead `LLM_MODEL`, the Redis key shapes, the workspace pins, both trees                            |
| Links & URLs    | 9/10  | +2  | Dead Discussions link removed, `llms.txt` shop entry repointed at the canonical; only the pending-deploy 404s remain (F21)                                                           |
| Navigation      | 9/10  | 0   | No docs site. The four cross-file anchors were verified against their heading targets after the rewrite                                                                              |
| Duplication     | 9/10  | +4  | One home per fact: the scripts table and quickstart live in README (the doc a reader hits first), the branch model in CONTRIBUTING, and every verify instruction is the exact CI set |
| Coverage        | 9/10  | +4  | The `(hub)` group, CSP, `clients/redis/`, newsletter metering, `parseActionInput`, `mdx-components.tsx`, and `_reports/` are all documented                                          |
| Consistency     | 8/10  | +2  | Node is one number (22) everywhere; the `export *` rule is true as written. Four taglines remain, pending a copy decision (F38)                                                      |
| README accuracy | 9/10  | +4  | The env table is rebuilt around what the code actually requires, including the two variables that don't degrade gracefully                                                           |
| Freshness       | 9/10  | +6  | The docs now describe the post-audit app. The gap this run measured is closed                                                                                                        |

## Action items

### Fix Now

None — every HIGH and MEDIUM is closed.

### Next Release

| #   | Priority | Task (finding ID)                                                                                                             | Effort |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P2       | Decide the tagline question: converge README + `llms.txt` on `SITE_TAGLINE`, or record the variants as per-surface copy (F38) | 10 min |

### Backlog

| #   | Priority | Task (finding ID)                                                                                   | Effort |
| --- | -------- | --------------------------------------------------------------------------------------------------- | ------ |
| 2   | P3       | After deploy: re-check `/blog`, `/newsletter`, `/shop`, `/llms.txt` resolve (F21)                   | 5 min  |
| 3   | —        | F23 accepted, not scheduled: the duplicate H1 is inside the auto-managed `nextjs-agent-rules` block | —      |

## Resolved since last audit

| ID  | Issue                                                                                             | How it was resolved                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F5  | `docs-only` CI skip fired on mixed code+docs PRs                                                  | `predicate-quantifier: every` added, with a comment recording why; the stale `stale.yml` / `pr-title.yml` globs were dropped as the finding also asked                     |
| F7  | "barrel per kind" was false for `lib/config/`                                                     | `src/lib/config/index.ts` was created, with a header comment explaining that `env.ts` is deliberately excluded because it is `server-only`. Its `export *` line is now F36 |
| F12 | CI env comment claimed a missing `GOOGLE_API_KEY` fails the build, and named Cloudflare Analytics | Comment rewritten to state that every var is optional and that the placeholder key exists to exercise the configured-key path; the Cloudflare reference is gone            |

## Verified accurate (not findings)

Recorded so a future run doesn't re-litigate them. Each was checked against code on this run:

- The `lib/` kind list, `constants/`, `data/`, `hooks/`, `schemas/`, `types/`, and `utils/` descriptions all match `ls`, including "`cn.ts` is the one bare name" and the `text/ svg/ storage/ writer/` sub-groups.
- The drafts mechanism is documented correctly and precisely: `src/content/**/_drafts/`, gitignored, dev-server only, gated on `NODE_ENV` rather than `APP_ENV` — and the code's own comment gives the same reason AGENTS.md does.
- `AGENTS.md:133`'s caching claim is still exactly true: `cacheComponents` is on and `grep -rn "use cache" src/` returns nothing, so "no `use cache` readers exist yet" holds.
- The four quota constants AGENTS.md names do exist with those names; the omission is the three newsletter ones (F33), not a rename.
- `.github` inventory is still exact — the five workflows and `dependabot.yml` exist; commitlint, `pr-title.yml`, `CODEOWNERS`, and `stale.yml` are genuinely absent as claimed.
- Both path aliases (`@/*`, `@env`) resolve; strict mode is on; `.env.example` is committed and `docs/` is gitignored.
- All nine tools in `TOOLS` appear in the README with accurate taglines; the repo URL is one canonical form (`github.com/Timonwa/tools-by-timonwa`) everywhere and matches `origin`.
- Every internal Markdown link resolves, and the one cross-file anchor (`README.md#environment-variables`) matches a real heading.
- README's Privacy section is accurate against the code, including the in-memory hour-long URL fetch cache, `sessionStorage` for BYOK keys, `localStorage` for history, and BYOK requests skipping rate limits.
