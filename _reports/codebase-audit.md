# Codebase audit — The Productivity Bug

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `code-restructuring` · **Scope:** whole repo (`src/`, config, CI, git hygiene) · **Overall:** 7/10

Baseline note: this is the first run — no previous report existed at `_reports/codebase-audit.md`, so every finding is `NEW` and there is no "Resolved since last audit" section.

Context worth stating up front, because it shapes the scores: the code itself is unusually clean. Zero `TODO`/`FIXME`/`HACK`/`XXX` markers in the whole tree, zero `any`, zero unsafe casts, one narrowly-scoped `eslint-disable`, no commented-out code, no committed secrets or build artifacts, and `pnpm exec tsc --noEmit` / `pnpm lint` / `pnpm build` all pass clean. The deductions below are concentrated in four places: an unpatched dependency tree, a CI gate that can be bypassed, a total absence of tests, and an unvalidated Server Action boundary.

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | N/A      | 7/10    | N/A | N/A   |

## Findings

| ID  | Severity | Category       | Status | Issue                                                                                     | Location                                                       |
| --- | -------- | -------------- | ------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | CRITICAL | Dependencies   | NEW    | 21 known vulnerabilities (14 high) incl. 9 Next.js advisories fixed in 16.2.11            | `package.json:38`, `pnpm-workspace.yaml:11`                    |
| 2   | HIGH     | Git/CI hygiene | NEW    | Any PR touching one `.md`/`.mdx` file skips lint, format, typecheck and build entirely    | `.github/workflows/ci.yml:26`                                  |
| 3   | HIGH     | Tests          | NEW    | No test infrastructure at all; CI `test` job hard-disabled and calls a nonexistent script | `package.json:7`, `.github/workflows/ci.yml:96`                |
| 4   | HIGH     | Error handling | NEW    | Server Action inputs are never validated; unbounded client data reaches the model prompt  | `src/lib/server/actions/social-posts.action.ts:143`            |
| 5   | MEDIUM   | Error handling | NEW    | Quota counters are non-atomic — a failed `EXPIRE` locks an IP out permanently             | `src/lib/server/utils/rate-limit.utils.ts:94`                  |
| 6   | MEDIUM   | Error handling | NEW    | `subscribeNewsletter` has no rate limit; anyone can mass-subscribe arbitrary addresses    | `src/lib/server/actions/newsletter.action.ts:23`               |
| 7   | MEDIUM   | Error handling | NEW    | Five catch blocks report every failure as "we couldn't reach the server", logging nothing | `src/lib/hooks/writer/use-writer.ts:196`                       |
| 8   | MEDIUM   | Error handling | NEW    | BYOK save/clear report success unconditionally over a swallowed storage write             | `src/components/_shared/byok/ByokDrawer.tsx:54`                |
| 9   | MEDIUM   | Tech debt      | NEW    | `useSeoMetaHistory` reimplements the `createToolHistory` factory verbatim                 | `src/lib/hooks/use-seo-meta-history.ts:43`                     |
| 10  | MEDIUM   | Tech debt      | NEW    | Word Counter re-hardcodes five character limits that already exist as constants           | `src/components/tools/word-counter/WordCounterTool.tsx:16`     |
| 11  | MEDIUM   | Tech debt      | NEW    | Four oversized units mixing several jobs in one file/function                             | `src/components/tools/svg-to-jsx/SvgToJsxTool.tsx:98`          |
| 12  | MEDIUM   | Error handling | NEW    | A fresh Upstash client is constructed per call, including on a path that never uses it    | `src/lib/server/utils/rate-limit.utils.ts:23`                  |
| 13  | LOW      | Error handling | NEW    | Floating clipboard promise reports success even when the copy was blocked                 | `src/components/tools/article-to-seo-meta/SeoMetaTool.tsx:168` |
| 14  | LOW      | Dead code      | NEW    | Three fully dead exports and two barrels nothing imports                                  | `src/lib/config/tints.ts:5`                                    |
| 15  | LOW      | Dead code      | NEW    | `jsx-a11y/no-autofocus` override targets paths that no longer exist and matches nothing   | `eslint.config.mjs:14`                                         |
| 16  | LOW      | Dependencies   | NEW    | `allowBuilds` pre-approves postinstall scripts for four packages not in the lockfile      | `pnpm-workspace.yaml:2`                                        |
| 17  | LOW      | Tech debt      | NEW    | CI and `.env.example` both claim `GOOGLE_API_KEY` is required; it is optional             | `.github/workflows/ci.yml:75`                                  |
| 18  | LOW      | Tech debt      | NEW    | Unnamed magic values, one of them an unintentional inconsistency (1200 vs 1500 ms)        | `src/components/tools/article-to-seo-meta/SeoMetaTool.tsx:170` |
| 19  | LOW      | Git hygiene    | NEW    | 25 local branches (21 already merged); four violate the documented naming rule            | git refs                                                       |
| 20  | LOW      | Tech debt      | NEW    | `runtime = "edge"` in 13 of 16 OG routes, three different rationale comments              | `src/app/(tools)/lorem-ipsum/opengraph-image.tsx:7`            |
| 21  | LOW      | TS strictness  | NEW    | `noUncheckedIndexedAccess` off, and an unsound index access is reachable from the client  | `tsconfig.json:2`                                              |

---

### F1 — Production is running a dependency tree with 21 known vulnerabilities, and the patch is already sitting in an unmerged PR

- **What:** `pnpm audit` reports **21 vulnerabilities: 14 high, 7 moderate**. Nine of them are Next.js advisories against the pinned `next: "16.2.10"` (`package.json:38`), all fixed in `16.2.11`. Three land squarely on this app's only server surface, which is Server-Actions-only:
  - `GHSA-m99w-x7hq-7vfj` — Denial of Service in App Router using Server Actions (high)
  - Unauthenticated disclosure of internal Server Function endpoints (moderate)
  - Unbounded Server Action payload (moderate)
  - plus two SSRF advisories, a middleware/proxy bypass, and cache confusion of response bodies.

  The fix already exists in the repo: `origin/dependabot/npm_and_yarn/npm_and_yarn-1c4f37dfd6` (commit `af12184`, dated 2026-07-28) bumps `next` 16.2.10 → 16.2.11 and has been open roughly three weeks. The `npm_and_yarn` group is Dependabot's _security_ channel, not routine version updates.

  Two more, verified against real usage:
  - **The `postcss` override is stale and gives false confidence.** `pnpm-workspace.yaml:11` pins `postcss: ">=8.5.10"` with a comment citing GHSA-qx2v-qp2m-jg93. Two newer advisories now require `>=8.5.18` and `>=8.5.23`, so the override no longer covers the tree it was written to protect.
  - **`dompurify@3.4.12` has an XSS advisory** (`GHSA-55q2-fjhq-7xh7`, needs `>=3.4.13`) and DOMPurify is the _only_ thing standing between pasted markup and `dangerouslySetInnerHTML` in `src/components/tools/svg-to-jsx/SvgToJsxTool.tsx:145,310`. The specific advisory concerns `IN_PLACE` hook removal, and this call site uses neither `IN_PLACE` nor hooks (`USE_PROFILES: { svg: true, svgFilters: true }`), so it is **not exploitable as written** — patch it as hygiene on the app's one real sanitization boundary, not as an active breach.

- **Why it matters:** The app is live. A remotely-triggerable DoS on the Server Action path and an unauthenticated endpoint-disclosure bug are exactly the class of thing that gets exercised on a public free-tool site, and the remediation cost here is merging a PR that already exists. OWASP A06 (Vulnerable and Outdated Components).
- **Fix:** Merge the open Dependabot security PR (`next` → `16.2.11`) and re-run `pnpm audit`. Raise the `postcss` override to `>=8.5.23` and bump `dompurify` to `>=3.4.13`. `sharp` (`<0.35.0`) arrives transitively via `next`, so confirm it clears after the bump. Then hand the remaining transitive highs (`brace-expansion`, `js-yaml`, `nanoid`) to `dependency-audit`.

### F2 — Any PR that touches a single Markdown file bypasses the entire CI quality gate

- **What:** `.github/workflows/ci.yml:26-40` uses `dorny/paths-filter@v3` with a `docs-only` filter listing `'**/*.md'` and `'**/*.mdx'`, then gates both real jobs on `if: needs.changes.outputs.should-skip != 'true'` (lines 49, 71). `paths-filter`'s default `predicate-quantifier` is **`some`** — a filter output is `true` when _any_ changed file matches _any_ pattern, not when _all_ of them do. So `docs-only` is `true` for a PR that changes one `README.md` alongside a hundred `.tsx` files, and `lint-and-typecheck` plus `build` are both skipped.

  This is not hypothetical for this repo's actual commit shape. Commit `26407b5` ("refactor(ui): prop-driven patterns…") changed **2 Markdown files and 117 TypeScript files**; `5c84fb8` changed 1 Markdown file and 131 TypeScript files. A PR carrying either would have merged with zero lint, zero format check, zero typecheck, and zero build.

  A second, narrower defect in the same filter: `'**/*.mdx'` is not documentation here. `src/content/**/*.mdx` is the site's content, and its frontmatter is Zod-validated at build time by `createMdxLoader` (`src/lib/server/utils/create-mdx-loader.utils.ts:47-52`), which **throws** on a mismatch. A content-only PR with a bad `publishedAt` therefore merges green and breaks the next production deploy.

  Also stale: the filter references `.github/workflows/stale.yml` and `.github/workflows/pr-title.yml`, neither of which exists.

- **Why it matters:** The repo's stated verification contract (AGENTS.md: "run all three; never report success on an unverified change") is enforced in CI — and that enforcement silently disappears on the majority of this project's real, refactor-shaped PRs. A broken build reaches `main` with a green check.
- **Fix:** Add `predicate-quantifier: 'every'` to the `paths-filter` `with:` block so `docs-only` means what its name says. Remove `'**/*.mdx'` from the filter entirely — MDX changes must build. Drop the two dead workflow paths.

### F3 — No test infrastructure exists, and the CI test job is permanently switched off

- **What:** `package.json` has no `test` script and no test runner in `devDependencies` (no vitest, jest, playwright, or node:test wiring). No `*.test.*` / `*.spec.*` file exists anywhere in the repo. `.github/workflows/ci.yml:89-107` defines a `test` job guarded by `if: false # Enable when tests are configured` whose step runs `pnpm test` — a script that does not exist, so the job would fail immediately if enabled.

  The gap is most consequential on pure, trivially testable functions that carry security or correctness weight:
  - `isBlockedHost` / `assertSafeArticleUrl` (`src/lib/server/utils/ai/article-source-validation.utils.ts:8-48`) — the SSRF blocklist, hand-rolled string and regex matching over loopback, link-local, cloud-metadata and RFC 1918 ranges. A regression here is invisible.
  - `checkAndIncrementQuota` (`rate-limit.utils.ts:78`) and `secondsUntilUtcMidnight` — the money path for a platform-funded Gemini key.
  - `toUserMessage` (`ai/errors.utils.ts:15`) — ~15 ordered pattern rules where order is load-bearing (the file's own comment at lines 25-28 explains that moving the `RATE_LIMIT_USER` check would mis-report an exhausted allowance as a transient error). Nothing verifies that ordering.
  - `SLUG_PATTERN` filtering in `createMdxLoader:58-75`, and `src/lib/utils/text/case.utils.ts` (292 lines of AP/Chicago/APA title-case transforms driving a shipped tool).

- **Why it matters:** For a live app whose whole value is correctness of text transforms and whose cost exposure is a shared API key, there is currently no automated way to know a change broke any of it. The repo has just been through a large structural refactor (21 branches merged into the current one), which is precisely when a regression suite pays for itself.
- **Fix:** Add Vitest with a `test` script, then enable the CI job by replacing `if: false` with the same `should-skip` guard the other jobs use. Start with behavioral tests for the five items above — all are pure functions needing no DOM or network.

### F4 — Server Action inputs are never validated, so unbounded client data reaches the model prompt

- **What:** All four AI Server Actions accept structured params straight from the browser with compile-time types only and no runtime parsing. Server Action arguments are attacker-controlled — the TypeScript signature is erased at runtime. Verified reachable consequences:

  1. **Unsound index access producing `undefined` typed as `number`.** `src/lib/server/actions/social-posts.action.ts:88` reads `style.postLength` from the client and passes it to `resolveSocialPostCharLimit` → `LONGFORM_SOCIAL_POST_LENGTH_LIMITS[postLength]` (line 88). That object is a plain `{ short, medium, long }` (`src/lib/constants/social-post-style.constant.ts:71-75`). A call with `style.postLength = "xl"` yields `undefined`, which then (a) is interpolated into the prompt as `LinkedIn limit: undefined` (lines 139-146) and (b) ships to the client as `charLimit: undefined` on a `SocialPost` declared `charLimit: number`, rendering a `NaN` progress bar.
  2. **Unbounded prompt inflation.** `social-posts.action.ts:143` does `lines.push(\`Writing style: ${JSON.stringify(style)}\`)`— the entire client-supplied`style`object, any size, injected into the prompt.`seo-meta.action.ts:145-158`interpolates every entry of a client-supplied`existing: SeoMetaVariation[]`array with no length cap.`xThreadLength` is interpolated unclamped (`social-posts.action.ts:113`).
  3. **The existing guards don't cover this.** `MAX_ARTICLE_INPUT_CHARS = 15_000` (`resolveArticleSource`) caps only the _article text_. `enforceDailyQuota` caps request **count** (10/day/IP for SEO meta, 5 for social posts), not request **size**. So a scripted caller within the legitimate quota can send ten requests whose prompts are orders of magnitude larger than any real one, all billed to the platform's `GOOGLE_API_KEY`. `maxOutputTokens` is capped; input is not.
  4. Only `platforms` reaching the _model output_ is schema-checked; the client-sent `platforms` array is joined raw into the prompt at `social-posts.action.ts:130`.

  Note the repo already knows this is the rule and believes it is met: `AGENTS.md:24` states validation covers "action inputs in the action files". `subscribeNewsletter` genuinely does parse with Zod (`newsletter.action.ts:30`); the four AI actions do not. `src/lib/schemas/` holds Zod schemas for content frontmatter, so the convention and the dependency are both already in place.

- **Why it matters:** Cost amplification against a shared, platform-funded API key on a free public tool, plus a prompt-injection surface (arbitrary attacker text lands in the system prompt via `style`) and a type-safety hole that reaches the UI. This also compounds F1's "Unbounded Server Action payload" and "DoS via Server Actions" advisories. OWASP API4 (Unrestricted Resource Consumption).
- **Fix:** Define a Zod schema per action in `src/lib/schemas/` (e.g. `seo-meta-input.schema.ts`, `social-posts-input.schema.ts`) and `parse()` the params as the first statement of each action, before `resolveArticleSource`. Use `z.enum` for `platforms` / `postLength` / `voice` / `tone`, `z.number().int().min(1).max(N)` for `xThreadLength` and `variationCount`, `z.array(...).max(3)` for `existing`, and `.max()` on every free-text field. Map a parse failure through the existing `toUserMessage` coded-error path.

### F5 — Quota counters are non-atomic, so a failed `EXPIRE` can lock an IP out permanently

- **What:** `src/lib/server/utils/rate-limit.utils.ts:94-100` runs four independent round-trips:

  ```ts
  const userCount = await redis.incr(userKey);
  if (userCount === 1) await redis.expire(userKey, ttl);
  if (userCount > perUserDaily) return { allowed: false, reason: "user" };
  const poolCount = await redis.incr(poolKey);
  if (poolCount === 1) await redis.expire(poolKey, ttl);
  ```

  Two concrete failures:
  - **Permanent lockout.** The `EXPIRE` is only attempted on the request that creates the key. If that request's `EXPIRE` fails or the function is torn down between the `INCR` and the `EXPIRE` (a serverless invocation being frozen mid-await is routine), the key has no TTL and never resets at UTC midnight. That IP hash is then rate-limited forever, and because the outer `catch` fails open only on _errors_, a returned `{allowed: false, reason: "user"}` is not a failure state anything recovers from. The same applies to `poolKey`, where the blast radius is every hosted user of that tool.
  - **Users charged for requests that never ran.** When the shared pool is exhausted (line 100), `userKey` has already been incremented at line 94. The request is refused, but it still consumed one of the caller's 5–10 daily generations.

- **Why it matters:** Both failure modes deny service to legitimate users of a free tool, and neither is observable — there is no log line, no metric, and no way for a locked-out visitor to self-recover before someone manually deletes the key.
- **Fix:** Make key creation atomic with `SET key 0 EX <ttl> NX` followed by `INCR`, or move both counters into a single Lua script / `redis.pipeline()`. Check the pool _before_ incrementing the user counter, or decrement the user counter on a pool refusal. `@upstash/ratelimit` implements both correctly and is the same vendor's own library. Depth: `redis-audit`.

### F6 — The newsletter Server Action has no rate limit, so anyone can mass-subscribe arbitrary addresses

- **What:** `subscribeNewsletter` (`src/lib/server/actions/newsletter.action.ts:23-93`) validates the email shape with Zod and then POSTs it to `https://api.sender.net/v2/subscribers` with `trigger_automation: false` and two hardcoded group IDs. There is no captcha, no honeypot, no origin check, and — unlike every AI action in the same directory — no call to `enforceDailyQuota`, despite that helper being available and generic (`src/lib/server/utils/ai/quota.utils.ts:22`). A Server Action is a plain POST endpoint; a script can call it in a loop.

  Two effects: a third party's email address can be added to the list without their consent (an email-bombing vector, since the flow has no double opt-in), and the account's Sender.net subscriber quota can be exhausted by garbage. Note the action also treats an "already subscribed" response as success (lines 73-78), which conveniently hides repeated abuse from anyone watching error rates.

- **Why it matters:** The mailing list is a real business asset and consent record. Poisoning it is cheap, silent, and hard to unwind. OWASP API4 (Unrestricted Resource Consumption).
- **Fix:** Apply the existing `checkAndIncrementQuota` to this action with its own `toolSlug` (e.g. `newsletter`, a low per-IP daily cap), which reuses the IP-hash plumbing already written. Given the current implementation fails open when Upstash is absent, pair it with a hidden honeypot field or a lightweight proof-of-work, and enable Sender.net's double opt-in so a subscription always requires the address owner to confirm.

### F7 — Five catch blocks attribute every failure to the user's internet connection and log nothing

- **What:** The identical block appears verbatim five times — `src/lib/hooks/writer/use-writer.ts:196-200` and `:287-290`, `src/components/tools/article-to-seo-meta/SeoMetaTool.tsx:142-147` and `:202-207`, `src/components/tools/article-to-seo-meta/SeoMetaForm.tsx:177-181`:

  ```ts
  } catch {
    setError("We couldn't reach the server. Check your internet connection and try again.");
  }
  ```

  Each wraps the _entire_ success path, not just the `await`. Anything thrown inside — a Next.js Server Action body-size rejection (the default limit is 1 MB, and these payloads carry a whole article plus history), a framework digest error, a serialization failure, or an outright bug in the state updates and `upsert()` that follow — is reported to the user as a connectivity problem. There is no `console.error`, no `error` binding, and no rethrow, so the real cause is unrecoverable in production.

  This is a deliberate-looking pattern rather than an oversight, which is what makes it worth flagging: the codebase's server-side error handling is exemplary (`toUserMessage` in `ai/errors.utils.ts` logs with a tag and maps ~15 typed cases), and the client path is the one place that throws diagnostics away. The message is also a duplicated literal in five files with no shared constant.

- **Why it matters:** A user with perfect connectivity is told to check their internet, and the maintainer has nothing to debug with. Any client-side regression in the generate/regenerate flow will present as "the tool is flaky" with no signal anywhere.
- **Fix:** Bind and log the error (`catch (error) { console.error("[writer:generate]", error); … }`), narrow the `try` to the `await` so post-success bugs surface as real errors, and lift the copy into a named constant in `src/lib/constants/`. The four generate/regenerate handlers share one shape end to end (set busy → clear error → read BYOK → await → `if (!res.ok)` → `emitHostedUsage` → apply → catch → finally) and collapse into a single `runAiAction` wrapper, which fixes all five at once.

### F8 — Saving or clearing a BYOK API key reports success even when the write was swallowed

- **What:** `byokStorage.set` and `.clear` swallow every exception (`src/lib/utils/storage/byok.utils.ts:45`, `:52` — bare `catch {}`) and return `void`. `ByokDrawer.handleSave` (`src/components/_shared/byok/ByokDrawer.tsx:54-55`) calls `byokStorage.set(trimmed)` and then **unconditionally** returns `{ type: "success", message: "Key saved for this tab." }`; `handleClear` (`:58-61`) likewise always renders "Key cleared."

  Where `sessionStorage` is unavailable or full — Safari private browsing, storage-partitioned embeds, hardened privacy settings — the user sees a green "Key saved for this tab", and every subsequent generation silently reverts to the hosted path: either burning their 5–10 free daily runs or failing with "This tool isn't available to run right now" (`ai/errors.utils.ts:33`) while the UI insists their key is stored. The `.clear()` case is the worse of the two in principle: the user is told their API key was removed from the browser when it may still be there.

  The same silent-write pattern is repeated across the storage layer — `createLocalStorageJson.save` (`local-storage-json.utils.ts:19-23`), and `create-writer-storage.utils.ts:86-89`, `:121-124`, `:168-174` — so run history can also stop persisting with no signal. That is lower-stakes; the BYOK key is the one the user is explicitly told is being stored, on a panel that promises "Stored in sessionStorage".

- **Why it matters:** The BYOK flow is the app's stated answer to every quota error, so a false "saved" turns the primary remediation path into a dead end, and the whole tool looks broken. Silent failure on an explicit, user-confirmed action is also the one case where a swallowed write is never acceptable.
- **Fix:** Have `byokStorage.set`/`.clear` return a boolean (or throw) and let `handleSave`/`handleClear` render the error status they already support: `{ type: "error", message: "Your browser blocked storing the key — private browsing can do this." }`. A read-back verification after `setItem` catches the quota case too.

### F9 — `useSeoMetaHistory` reimplements the `createToolHistory` factory verbatim

- **What:** `src/lib/utils/writer/create-tool-history.utils.ts:13-42` exists precisely to build a deduped, capped, localStorage-backed history hook. Its sibling uses it in four lines (`src/lib/hooks/writer/use-social-posts-history.ts:18-21`). `src/lib/hooks/use-seo-meta-history.ts:29-56` instead hand-rolls the whole thing — `createLocalStorageJson` + `createHistoryStore` + an `applyUpsert` that is character-for-character the factory's body (identity lookup, id reuse, filter, `[full, ...without].slice(0, MAX_HISTORY_ENTRIES)`).
- **Why it matters:** The dedup-by-source and 10-entry-cap rules now live in two places. Change the cap semantics or the identity rule in the factory and the SEO Meta tool silently keeps the old behavior — the exact drift the factory was written to prevent. AGENTS.md's "Reuse the shared layer" names this file as shared plumbing.
- **Fix:** Replace lines 29-56 with `createToolHistory<SeoMetaHistory>({ key: STORAGE_KEYS.seoMetaHistory, isEntry: isSeoMetaHistoryEntry })`, matching the social-posts hook. Roughly 25 lines deleted, no behavior change.

### F10 — Word Counter re-hardcodes five character limits that already exist as constants

- **What:** `src/components/tools/word-counter/WordCounterTool.tsx:16-22`:

  ```ts
  const PLATFORM_LIMITS: { label: string; limit: number }[] = [
  	{ label: "SEO title", limit: 60 }, // = SEO_META_TITLE_MAX
  	{ label: "Meta description", limit: 160 }, // = SEO_META_DESC_MAX
  	{ label: "X / Twitter post", limit: 280 }, // = SOCIAL_POST_PLATFORM_CHAR_LIMITS.x
  	{ label: "Bluesky post", limit: 300 }, // = SOCIAL_POST_PLATFORM_CHAR_LIMITS.bluesky
  	{ label: "LinkedIn post", limit: 3000 }, // = SOCIAL_POST_PLATFORM_CHAR_LIMITS.linkedin
  ];
  ```

  All five values are already single-sourced: `src/lib/constants/seo-meta.constant.ts:9,13` and `src/lib/constants/social-post-platforms.constant.ts:35-37`. The repo does this correctly elsewhere — `src/lib/server/services/seo-meta.service.ts:24-27` derives its ranges from the constants.

- **Why it matters:** When a platform changes its limit (X has done so twice), the constant gets updated, the AI tools follow, and the Word Counter silently keeps showing the stale number — a wrong answer in a tool whose entire job is that number. This is a correctness bug waiting on an external event, which is why it sits above the other tech-debt items.
- **Fix:** Import the existing constants and build `PLATFORM_LIMITS` from them, keeping only the labels local.

### F11 — Four oversized units mixing several jobs

- **What:** Only seven files in `src/` exceed 250 lines, and three of those are justified (data registries or thin builders). Four are not:
  - `src/components/tools/svg-to-jsx/SvgToJsxTool.tsx` — 454 lines, component body lines 98-427 (~330). Holds five unrelated concerns that are not UI: SVG root-attribute read/write regex helpers (`readRootAttr`/`writeRootAttr`, lines 77-95), component-name sanitization (line 70), checkerboard CSS generation (lines 56-68), a click-outside/Escape popover (117-133), and a blob download (173-183). The first three are pure string logic belonging in `src/lib/utils/svg/`, which already exists.
  - `src/lib/hooks/writer/use-writer.ts` — a single ~360-line function (lines 32-391) returning a 40-key object, bundling generation (152-297), post editing (230-258), clipboard (299-309), and history persist/restore (100-119, 311-334).
  - `src/components/tools/article-to-seo-meta/SeoMetaTool.tsx` — ~300-line body with 10 `useState` calls and five async handlers, two of which duplicate each other (F7).
  - `src/components/_shared/writer/TemplatesPicker.tsx` — 501 lines holding four components (`TemplatesPicker`, `TemplateChip`, `TemplateEditor`, `TemplatePreview`) against the repo's own documented one-component-per-folder rule (AGENTS.md, "Repository Structure").

  Also over ~80 lines in one function: `createWriterStorage` (`src/lib/utils/storage/create-writer-storage.utils.ts:28-187`, ~160 lines, with three independently testable `read*` validators inline) and `SeoMetaForm` (`SeoMetaForm.tsx:74-261`).

- **Why it matters:** These are the four files a contributor is most likely to need to change and least able to reason about, and the pure logic buried in them (`readRootAttr`, the `read*` validators) is currently untestable without mounting a React component — which interacts directly with F3.
- **Fix:** Move the SVG string helpers into `src/lib/utils/svg/`, split `TemplatesPicker` into its four files per `code-structure`, and extract `useWriterGeneration` / `usePostEdits` / `useWriterHistory` from `useWriter`. Also relocate `CASE_GROUPS` (`src/lib/utils/text/case.utils.ts:184-288`) — it is UI presentation data (labels, icons, descriptions) sitting in `lib/utils/`; it belongs in `lib/constants/`.

### F12 — A fresh Upstash client is constructed on every call, including on a path that never uses it

- **What:** `getRedis()` (`src/lib/server/utils/rate-limit.utils.ts:23-31`) calls `new Redis({ url, token })` on every invocation — no module-level singleton. Worse, `getRateLimitStatus()` (line 111-113) exists only to answer "is rate limiting configured?" and does so via `getRedis() !== null`, constructing a whole client and immediately discarding it. That function backs the navbar usage pill, so it runs on essentially every tool page load through `fetchSeoMetaUsage` / `fetchSocialPostsUsage`.
- **Why it matters:** Per-call client construction defeats connection reuse and contradicts the repo's own `clients/` convention, where `gemini.client.ts` is described in AGENTS.md as a "configured SDK singleton". The status path in particular does allocation work to read two environment variables.
- **Fix:** Hoist the client to a module-level lazy singleton (or a `clients/redis.client.ts` alongside `gemini.client.ts`, matching the documented structure), and have `getRateLimitStatus` test `isProduction && !!env.UPSTASH_REDIS_REST_URL && !!env.UPSTASH_REDIS_REST_TOKEN` directly without touching the client. Depth: `redis-audit`.

### F13 — Floating clipboard promise reports success even when the copy was blocked

- **What:** `src/components/tools/article-to-seo-meta/SeoMetaTool.tsx:168-170`:

  ```ts
  navigator.clipboard.writeText(text);
  setCopiedAll(true);
  setTimeout(() => setCopiedAll(false), 1200);
  ```

  The promise is neither awaited nor `.catch()`-ed, and the "Copied" state is set unconditionally. When the clipboard is denied (no transient user activation, permissions policy, insecure context) the user sees "Copied" with nothing on their clipboard, plus an unhandled promise rejection. The repo's other three call sites all get this right — `CopyButton/index.tsx:33`, `ShareBar.tsx:162`, and `use-writer.ts:301` each `await` inside a `try/catch` and surface a real fallback message ("Your browser blocked copying…").

- **Why it matters:** Silent data loss on the tool's primary output action, in the one spot that diverges from an already-correct house pattern.
- **Fix:** Make the handler `async`, `await` the write inside `try/catch`, and set `copiedAll` only on success — or just delegate to the existing `CopyButton`, which already owns copy-with-timeout feedback.

### F14 — Three fully dead exports and two barrels nothing imports

- **What:** Verified by whole-`src` word-boundary grep, tracing barrel re-exports through to real consumers:
  - `TINTS` — `src/lib/config/tints.ts:5`. Its declaration is the only occurrence in the repo; not even re-exported by a barrel.
  - `CREATOR_SHOP_URL` — `src/lib/config/site.ts:29`. Only occurrence.
  - `CardFooter` — `src/components/ui/blocks/Card/index.tsx:55`, re-exported at `blocks/index.ts:9`, zero consumers (the only other mention is a doc comment).
  - `src/lib/server/utils/index.ts` and `src/lib/server/clients/index.ts` — barrels no file imports. Every consumer reaches past them (`@/lib/server/utils/og-image.utils`, `../utils/create-mdx-loader.utils`, `../rate-limit.utils`, `../../clients/gemini.client`), which also quietly contradicts the "barrel per kind, import as `@/lib/<kind>`" rule in AGENTS.md.

  Separately, ~30 exports are used only inside their own file — the `export` keyword is the dead part, not the code. The largest cluster is the eight composition types in `src/lib/types/writer.type.ts:25-84` (`GenerateExtras`, `GenerateParams`, `RegenerateParams`, `GenerateResult`, `RegenerateResult`, `StyleTemplatesApi`, `HistoryApi`, `WriterFeatures`), all re-exported through `types/index.ts` but used only to build `WriterRuntime` in the same file.

- **Why it matters:** Small in isolation, but a public export is a maintenance promise — every one of these is surface a future refactor has to preserve or reason about. The orphan barrels matter slightly more: they signal the import convention isn't actually being followed.
- **Fix:** Delete the three dead exports. Either route consumers through the two barrels or delete them. Drop `export` from the file-local types (keeping `WriterRuntime` exported).

### F15 — The `jsx-a11y/no-autofocus` override targets paths that no longer exist and matches nothing

- **What:** `eslint.config.mjs:14-20` disables `jsx-a11y/no-autofocus` for `"components/tools/article-to-social-posts/writer/TemplatesPicker.tsx"` and `"components/tools/slug-generator/SlugGeneratorTool.tsx"`. Three independent reasons this block is inert: both globs omit the `src/` prefix that every file in this repo now carries; the first file moved to `src/components/_shared/writer/TemplatesPicker.tsx` during the refactor; and `grep -rn "autoFocus" src/` returns no JSX usage at all (only a `[data-autofocus]` selector string in `Drawer/index.tsx:51`).
- **Why it matters:** The comment above it documents a "reviewed autofocus exception" that no longer exists, so it reads as a live a11y carve-out during review when the rule is in fact fully enforced. If `autoFocus` is reintroduced at either intended location, the suppression won't apply and CI will fail with a confusing message.
- **Fix:** Delete lines 12-20. If an exception is needed later, add it with the correct `src/`-prefixed path.

### F16 — `allowBuilds` pre-approves postinstall scripts for four packages that aren't installed

- **What:** `pnpm-workspace.yaml:2-8` lists `@google/genai`, `cpu-features`, `protobufjs`, `ssh2`, `unrs-resolver`, and `sharp` under `allowBuilds`. Checked against `pnpm-lock.yaml`: only `unrs-resolver` and `sharp` are present. The other four — including `@google/genai`, a leftover from before the migration to `@ai-sdk/google`, and `ssh2`/`cpu-features`, which have native build steps — are not in the tree.
- **Why it matters:** `allowBuilds` is a supply-chain control: it says "this package may run arbitrary code at install time". Standing approvals for packages nobody uses mean that if any of them re-enters the tree transitively, its install script runs unreviewed. It also misrepresents the dependency set to anyone reading the file.
- **Fix:** Remove the four stale entries, keeping `sharp` and `unrs-resolver`.

### F17 — CI and `.env.example` both claim `GOOGLE_API_KEY` is required; it is optional

- **What:** `.github/workflows/ci.yml:75-79` comments: "env.ts validates required vars at module load via Zod. Missing GOOGLE_API_KEY fails the build with a Zod error." That is false — `src/lib/config/env.ts:11` declares `GOOGLE_API_KEY: z.string().optional()`, and the file's own docstring (line 27) says "all optional so the app builds without them". Nothing fails. The same comment references "Cloudflare Analytics" as an optional integration; no analytics exist anywhere in the repo. `.env.example` also labels `GOOGLE_API_KEY` "# Required".
- **Why it matters:** The comment describes a safety net that isn't there. A production deploy that forgets `GOOGLE_API_KEY` boots fine and every AI tool fails at runtime with "This tool isn't available to run right now" — and the same all-optional schema means a deploy missing `UPSTASH_REDIS_REST_URL` boots with rate limiting silently disabled on a metered API key, which is the more expensive version of the same problem.
- **Fix:** Correct the comment and drop the Cloudflare reference. Then decide the real contract: either keep everything optional (and delete "Required" from `.env.example`), or make `env.ts` require the keys that production genuinely needs when `APP_ENV === "production"` via a `superRefine`, so a misconfigured deploy fails loudly at boot. Depth: `environment-audit`.

### F18 — Unnamed magic values, including one unintentional inconsistency

- **What:** The repo is otherwise disciplined about named constants (`MAX_ARTICLE_INPUT_CHARS`, `MAX_HISTORY_ENTRIES`, `SEO_META_TITLE_MAX`), which makes these stand out:
  - **Copy-feedback timeout, four sites, three of them agreeing:** `CopyButton/index.tsx:35` `1500`, `ShareBar.tsx:164` `1500`, `use-writer.ts:303` `1500`, and `SeoMetaTool.tsx:170` **`1200`** — almost certainly an unintended divergence. Wants `COPY_FEEDBACK_MS`.
  - **History debounce duplicated:** `use-writer.ts:117` and `SeoMetaTool.tsx:226` both `600`, both with the same "avoid hammering localStorage" comment.
  - **The variation-count union duplicated across three files** with no constant: the type `1 | 2 | 3` in `SeoMetaForm.tsx:25` and `use-seo-meta-history.ts:18`, the clamp `Math.min(3, Math.max(1, … ?? 3))` in `seo-meta.action.ts:110`, and `[1, 2, 3] as const` in `SeoMetaForm.tsx:230`. `seo-meta.constant.ts` is the obvious home.
  - **Security-relevant width with no rationale:** `rate-limit.utils.ts:74` `digest.slice(0, 16)` truncates the IP hash to 64 bits. The surrounding code carefully documents _why_ it HMACs; it doesn't say why 16.
  - Smaller: `og-image.utils.tsx:40` `Math.floor(1040 / (fullTitle.length * 0.58))` (unexplained usable width and glyph ratio); `SeoMetaResults.tsx:31` `delta <= 5` (the amber "close to range" threshold, in a file that imports every other bound from constants); `ByokSection.tsx:33-34` three inline key-masking numbers; `SvgToJsxTool.tsx:285,302` checker sizes `8` vs `16`.
- **Why it matters:** The 1200 ms outlier is a real (if tiny) inconsistency users can feel, and the triplicated `1 | 2 | 3` union means adding a fourth variation count requires finding three files.
- **Fix:** Add `COPY_FEEDBACK_MS` and `HISTORY_PERSIST_DEBOUNCE_MS` to `src/lib/constants/`, move the variation-count union and its bounds into `seo-meta.constant.ts`, and add a one-line rationale comment for the hash truncation width.

### F19 — Branch sprawl and four branch names that violate the documented rule

- **What:** 25 local branches exist, of which 21 are already merged into the current branch, and several remain on the remote after merging into `main` (`feat/launch-pages`, `feat/seo-optimization`, `refactor/lib-structure`, `fix/security-hardening`, …). AGENTS.md specifies `type/short-kebab-description` with `feat/ fix/ docs/`; four names don't comply, including the branch this audit ran on: `code-restructuring`, `refactoring`, `fix-side-panel-not-responsive-on-mobile`, and `wip/reorg-snapshot`. One commit subject is 130 characters against the documented ≤100 rule: "refactor(footer, nav-actions): replace HandCoinsIcon with HeartIcon and update support labels added support btn to navbar" (which also reads as two changes in one commit).

  For balance: commit-message hygiene is otherwise strong — Conventional Commits with accurate scopes throughout, no merge-conflict markers anywhere in tracked files, no committed secrets, no build artifacts or `.env` files tracked (`git ls-files` confirms `.env.example` is the only env file), and a sane `.gitignore`.

- **Why it matters:** Low functional risk; it makes the branch list unreadable and means the current large refactor sits on a non-conforming branch, so the convention isn't self-enforcing.
- **Fix:** Prune merged local and remote branches (`git branch -d`, `git push origin --delete`). Consider enforcing the pattern in CI on `pull_request` so it stops drifting.

### F20 — `runtime = "edge"` in 13 of 16 OG routes, with three different rationale comments

- **What:** Of the 16 `opengraph-image.tsx` routes, 13 declare `export const runtime = "edge"` and 3 don't — `blog/[slug]`, `newsletter/[slug]`, `shop/[slug]`. The omission is **correct and necessary**: those three call `getPost`/`getIssue`/`getProduct`, which read MDX from disk via `node:fs` in `createMdxLoader`, and would break on the edge runtime. But nothing in those files says so, so it reads as an oversight. Meanwhile the 13 that do declare it carry three different comments, two asserting it's mandatory — e.g. `(tools)/lorem-ipsum/opengraph-image.tsx:7` "Edge runtime flag — required by Next.js for OG image routes using ImageResponse" vs `(tools)/word-counter/opengraph-image.tsx:7` "Edge runtime declaration for the OG image route" vs no comment at all in five files.
- **Why it matters:** A future contributor adding a content-backed OG route will copy the majority pattern, add `runtime = "edge"`, and break it at runtime with a confusing `node:fs` error. **Needs confirmation:** whether the edge pin is required at all on Next 16 — `ImageResponse` has worked under the Node runtime for several major versions, and I could not verify against the bundled docs in `node_modules/next/dist/docs/` (read access denied in this session), so the "required by Next.js" claim is unverified either way.
- **Fix:** Add a one-line comment to the three `[slug]` routes explaining they must stay on Node because they read from the filesystem. Check the bundled Next 16 docs and either drop the `runtime` export everywhere it isn't needed or standardize on one accurate comment.

### F21 — `noUncheckedIndexedAccess` is off, and an unsound index access is reachable from the client

- **What:** `tsconfig.json` enables `strict: true` (so `noImplicitAny` and `strictNullChecks` are on) but not `noUncheckedIndexedAccess`. The concrete cost is F4's first item: `LONGFORM_SOCIAL_POST_LENGTH_LIMITS[postLength]` (`social-posts.action.ts:88`) type-checks as `number` while returning `undefined` for any `postLength` outside `short|medium|long`, and `postLength` comes straight from an unvalidated client payload. With the flag on, that expression would be `number | undefined` and the compiler would have forced the missing guard.
- **Why it matters:** This is the single highest-leverage typing change available here — it turns a class of runtime `undefined` leaks into compile errors, in a codebase that otherwise has zero `any` and zero unsafe casts and would therefore actually benefit from the stricter signal.
- **Fix:** Enable `noUncheckedIndexedAccess` in `tsconfig.json` and fix the resulting errors (expect a small number given the code's existing discipline). Do it alongside F4, since the Zod schemas make most index accesses provably safe.

## Scorecard

| Category              | Score | Notes                                                                                                                                                  |
| --------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tech debt             | 8/10  | Zero TODO/FIXME/HACK markers and zero commented-out code in 306 files; deductions for 4 oversized units, one duplicated factory, and unnamed values    |
| Dead code             | 7/10  | 3 dead exports, 2 orphan barrels, an inert lint override, stale `allowBuilds` and CI filter paths — all small, none structural                         |
| TypeScript strictness | 9/10  | `strict` on, zero `any`, zero unsafe casts, one scoped disable, `tsc --noEmit` clean; `noUncheckedIndexedAccess` off and it costs (F21)                |
| Error handling        | 6/10  | Excellent typed server-side mapping (`toUserMessage`); undercut by an unvalidated action boundary, non-atomic quota writes, and 5 blind client catches |
| Tests                 | 1/10  | No runner, no test script, no test files; CI test job hard-disabled and calls a script that doesn't exist                                              |
| Git hygiene           | 8/10  | Clean Conventional Commits, no secrets/artifacts/conflict markers tracked; branch sprawl, 4 non-conforming names, one 130-char subject                 |

## Deep audits to run next

| Domain          | Signal spotted                                                                                                                                                                                                            | Run                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Dependencies    | 21 advisories / 14 high, an unmerged security PR, a stale `postcss` override (`>=8.5.10` vs required `>=8.5.23`), stale `allowBuilds` entries (F1, F16)                                                                   | `dependency-audit`                         |
| Security        | No CSP or security headers anywhere (no `middleware.ts`, no `headers()` in `next.config.ts`) while 12 `dangerouslySetInnerHTML` sites exist incl. an inline theme script; DOMPurify is the only sanitizer on the SVG tool | `security-audit`                           |
| API layer       | Four Server Actions with no Zod validation; `subscribeNewsletter` unthrottled; no shared action-input schema layer (F4, F6)                                                                                               | `api-audit`                                |
| Redis           | Non-atomic `INCR`+`EXPIRE` with a permanent-lockout path, per-call client construction, no key-builder module (F5, F12)                                                                                                   | `redis-audit`                              |
| Environment     | Every env var optional, so a prod deploy missing `UPSTASH_*` or `GOOGLE_API_KEY` boots silently degraded; CI and `.env.example` both misstate what's required (F17)                                                       | `environment-audit`                        |
| Frontend / perf | Four oversized components (501/454/391/373 lines), `TemplatesPicker` holding 4 components in one file against the repo's own rule (F11)                                                                                   | `frontend-audit`, then `performance-audit` |
| Accessibility   | `role="tooltip"` with no `aria-describedby` linkage (`HostedUsagePill.tsx:80`); the a11y lint carve-out is stale (F15)                                                                                                    | `accessibility-audit`                      |
| Conventions     | Two `lib/server` barrels bypassed by every consumer against the documented import rule; `CASE_GROUPS` UI data living in `lib/utils/`; 4 non-conforming branch names                                                       | `conventions-audit`                        |
| SEO             | Nothing adverse spotted — per-page metadata, canonicals, OG/Twitter, `sitemap.ts`, `robots.txt`, JSON-LD and 308 redirects for the renamed `/guides` are all present                                                      | optional                                   |

## Action items

Tiers for `production`: **Fix Now / Next Release / Backlog**.

### Fix Now

| #   | Priority | Task (finding ID)                                                                                                               | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Merge the open Dependabot security PR (`next` → 16.2.11), raise the `postcss` override to `>=8.5.23`, bump `dompurify` (F1)     | S      |
| 2   | P0       | Add `predicate-quantifier: 'every'` to the CI paths-filter and remove `**/*.mdx` from `docs-only` (F2)                          | S      |
| 3   | P1       | Zod-parse the params of all four AI Server Actions before any other work, with `.max()` on every array and free-text field (F4) | M      |
| 4   | P1       | Make the quota `INCR`+`EXPIRE` atomic and stop charging the per-user counter on a pool refusal (F5)                             | M      |

### Next Release

| #   | Priority | Task (finding ID)                                                                                                                 | Effort |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 5   | P1       | Stand up Vitest + a `test` script, enable the CI job, and cover the SSRF blocklist, quota, and `toUserMessage` rule ordering (F3) | M      |
| 6   | P1       | Rate-limit `subscribeNewsletter` and enable double opt-in on the Sender.net list (F6)                                             | S      |
| 7   | P2       | Log and narrow the five client catch blocks; extract a shared `runAiAction` wrapper (F7)                                          | M      |
| 8   | P2       | Return a success signal from `byokStorage.set`/`.clear` and surface the real status in the drawer (F8)                            | S      |
| 9   | P2       | Point `useSeoMetaHistory` at `createToolHistory` (F9)                                                                             | S      |
| 10  | P2       | Build Word Counter's `PLATFORM_LIMITS` from the existing constants (F10)                                                          | S      |
| 11  | P2       | Enable `noUncheckedIndexedAccess` and fix the fallout, alongside item 3 (F21)                                                     | S      |
| 12  | P3       | Make the Upstash client a singleton; drop the client construction from `getRateLimitStatus` (F12)                                 | S      |
| 13  | P3       | Fix the floating clipboard promise in `SeoMetaTool` (F13)                                                                         | S      |
| 14  | P3       | Correct the CI env comment and settle the required-vs-optional env contract (F17)                                                 | S      |

### Backlog

| #   | Priority | Task (finding ID)                                                                                             | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| 15  | P3       | Split `SvgToJsxTool`, `TemplatesPicker`, `useWriter`, `SeoMetaTool`; move `CASE_GROUPS` to `constants/` (F11) | L      |
| 16  | P3       | Delete the 3 dead exports; wire up or remove the 2 orphan barrels; unexport the file-local types (F14)        | S      |
| 17  | P4       | Remove the inert `no-autofocus` override (F15)                                                                | S      |
| 18  | P4       | Prune the 4 stale `allowBuilds` entries (F16)                                                                 | S      |
| 19  | P4       | Extract `COPY_FEEDBACK_MS` / `HISTORY_PERSIST_DEBOUNCE_MS` and the variation-count union; fix 1200→1500 (F18) | S      |
| 20  | P4       | Prune merged branches; consider a CI branch-name check (F19)                                                  | S      |
| 21  | P4       | Document why the three `[slug]` OG routes stay on Node; standardize the `runtime` comments (F20)              | S      |

## Resolved since last audit

First run — no previous report to compare against.
