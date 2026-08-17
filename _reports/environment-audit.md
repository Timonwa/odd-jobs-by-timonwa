# Environment audit — The Productivity Bug

**Date:** 2026-08-17 (fix pass applied same day) · **Phase:** production · **Mode:** fixes applied · **Branch:** `code-restructuring` · **Scope:** whole repo — `src/lib/config/env.ts`, `.env.example`, `.gitignore`, all `process.env` call sites, server actions/services/utils that consume secrets, CI config, and full git history (210 commits) · **Overall:** 9.5/10

## Score change (previous → current)

| Metric  | Previous | Current | Δ    | Trend |
| ------- | -------- | ------- | ---- | ----- |
| Overall | 7/10     | 9.5/10  | +2.5 | ▲     |

All nine findings closed. F5 was **applied by the maintainer** rather than by this pass — permissions here deny reads and writes of `.env*`, so the corrected content was handed over and confirmed applied (not independently verifiable from this session). The maintainer also confirmed the live host has the Upstash credentials set, which the fail-closed change below makes load-bearing.

**The headline change is behavioural, not cosmetic:** hosted AI generations now **fail closed**. Quota enforcement follows the Upstash credentials rather than `APP_ENV`, and a built app that cannot meter refuses hosted generations (directing the user to BYOK) instead of serving them unmetered. That removes the blast radius behind both F1 and F2 rather than only making their symptoms louder.

## Findings

| ID  | Severity | Category           | Status    | Issue                                                                                                                                        | Location                                                                  |
| --- | -------- | ------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | HIGH     | Tiering            | **FIXED** | `APP_ENV` defaults to the permissive tier, so an unset var silently disables every production cost control                                   | `src/lib/config/env.ts:9`                                                 |
| 2   | HIGH     | Validation         | **FIXED** | Upstash vars are optional with no production assertion and a fail-open path — quota enforcement can be absent in production with no signal   | `src/lib/config/env.ts:17`                                                |
| 3   | MEDIUM   | Validation         | **FIXED** | `UPSTASH_REDIS_REST_URL` is a bare `z.string()` where a URL is meant                                                                         | `src/lib/config/env.ts:17`                                                |
| 4   | MEDIUM   | Tiering            | **FIXED** | `LLM_MODEL` is non-secret tier config living in env, duplicating committed model constants                                                   | `src/lib/config/env.ts:15`                                                |
| 5   | MEDIUM   | Completeness       | **FIXED** | `.env.example` documents a contract the schema doesn't implement ("Required" vars that are optional) plus a wrong key-console URL and a typo | `.env.example:5-10`                                                       |
| 6   | LOW      | Validation         | **FIXED** | No `.min(1)` on any secret — an empty string validates as "set"                                                                              | `src/lib/config/env.ts:11-24`                                             |
| 7   | LOW      | Cross-app / parity | **FIXED** | CI `env` block asserts a Zod failure that cannot happen and names an integration that doesn't exist                                          | `.github/workflows/ci.yml:77-82`                                          |
| 8   | LOW      | Tiering            | **FIXED** | Analytics website id and Sender group ids are inline literals rather than tier-keyed committed config                                        | `src/app/layout.tsx:80`, `src/lib/server/actions/newsletter.action.ts:12` |
| 9   | LOW      | Secret leak        | **FIXED** | Full provider error objects are logged verbatim on paths that carry an API key — needs confirmation                                          | `src/lib/server/utils/ai/errors.utils.ts:16`                              |

### F1 — `APP_ENV` defaults to `development`, the tier that turns cost controls off

- **What:** `APP_ENV: z.enum(["development", "production"]).default("development")` (`src/lib/config/env.ts:9`) means an _unset_ `APP_ENV` validates cleanly and resolves `isProduction` to `false` (`env.ts:43`). `getRedis()` then returns `null` on its first line — `if (!isProduction) return null` (`src/lib/server/utils/rate-limit.utils.ts:26`) — so `checkAndIncrementQuota` returns `{ allowed: true, remaining: null }` (`rate-limit.utils.ts:85`) for every request, and `enforceDailyQuota` never throws (`src/lib/server/utils/ai/quota.utils.ts:26-33`). Nothing on the hosted-key path is gated on `APP_ENV`: `resolvePlatformApiKey` (`api-key.utils.ts:6-7`) and `createGeminiClient` (`gemini.client.ts:17-31`) serve requests off `GOOGLE_API_KEY` regardless of tier. The concrete failure case: a deploy where `APP_ENV` is missing from the host config serves unlimited free Gemini generations on the platform key, with the per-user cap and the shared daily pool both inert, no boot-time error, and the umami script also silently absent (`src/app/layout.tsx:76`). There is no `vercel.json` in the repo, so the value exists only in the host dashboard and cannot be verified from source — **whether the live deploy sets it needs confirmation**. `.env.example` ships the var commented out (`# APP_ENV=production`), which makes the omission easy to make. Note the good half of this: a _typo'd_ value (`prod`, `staging`) does fail fast, because `z.enum` only falls back to the default on `undefined`.
- **Why it matters:** The one variable that switches on all spend protection fails toward "off". Unmetered LLM spend on a public, no-sign-up site is the highest-value abuse target this app has, and the failure is silent in both directions — no crash, no log line, only the absence of a navbar pill (`getRateLimitStatus`, `rate-limit.utils.ts:111-113`) as a human-visible tell. OWASP A05 (security misconfiguration) / API4 (unrestricted resource consumption).
- **Fix:** Make the tier explicit rather than defaulted — drop `.default("development")` and require `APP_ENV`, setting it in every environment (`.env.local`, `.env.example` uncommented, and the host config). If the local-DX default is worth keeping, add a boot-time assertion in the same style as the existing `IP_HASH_SECRET` warning (`rate-limit.utils.ts:53-57`) that fails hard when the platform key is present but the tier isn't production. Also consider gating the hosted-key path itself on `isProduction` so "no tier" degrades to BYOK-only instead of to free-for-all.

### F2 — Upstash quota credentials are optional, unasserted, and fail open

- **What:** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are both `z.string().optional()` (`src/lib/config/env.ts:17-18`). When either is missing, `getRedis()` returns `null` (`rate-limit.utils.ts:29`) and every request is allowed; when both are present but wrong, the `redis.incr` calls throw and the `catch` returns `{ allowed: true, remaining: null }` — "failing open" by design (`rate-limit.utils.ts:104-107`). Both branches are correct for local and self-host use, but in a production deploy they mean a missing, typo'd, expired, or rotated-and-not-updated credential produces exactly the same behaviour as having no rate limiting at all. The only signal is a `console.error` on the second branch and _nothing_ on the first. The module already demonstrates the missing pattern: `if (isProduction && !env.IP_HASH_SECRET) console.warn(...)` (`rate-limit.utils.ts:53-57`) — that boot-time production assertion exists for the IP pepper but not for the credentials the entire quota system depends on, nor for `GOOGLE_API_KEY`.
- **Why it matters:** Same blast radius as F1 (unbounded hosted LLM spend) reached by a much more ordinary route — an Upstash token rotation. Fail-open is the right call for a transient Redis blip; it is the wrong call for a misconfiguration that persists indefinitely, and the schema currently cannot tell the two apart. OWASP API4.
- **Fix:** Add a production-tier assertion next to the existing `IP_HASH_SECRET` warning: when `isProduction` and a platform Gemini key is configured, treat absent Upstash credentials as a boot failure (`throw`) rather than a silent skip. Keep the per-request `catch` failing open, but distinguish it in the logs from "never configured" — and consider a counter/alert on repeated fail-open events so a dead credential surfaces instead of quietly paying for itself.

### F3 — `UPSTASH_REDIS_REST_URL` is typed as a bare string, not a URL

- **What:** `UPSTASH_REDIS_REST_URL: z.string().optional()` (`src/lib/config/env.ts:17`) accepts any string. The value is passed straight into `new Redis({ url, token })` (`rate-limit.utils.ts:30`). A truncated or malformed value ("console.upstash.com/...", a host with no scheme, a trailing-newline paste) therefore passes validation at boot and fails per-request inside the `try`, landing in the fail-open `catch` at `rate-limit.utils.ts:104`. This is the specific mechanism that makes F2 reachable by a plain copy-paste error.
- **Why it matters:** The whole point of boot-time Zod validation is that a bad value is caught once at startup, loudly, instead of once per request, silently. A `z.string()` on a URL field forfeits that for the only external service in the hot path.
- **Fix:** `UPSTASH_REDIS_REST_URL: z.string().url().optional()`. While there, give the credential fields the tightest type each one supports.

### F4 — `LLM_MODEL` is non-secret configuration held in env

- **What:** `LLM_MODEL: z.string().default("gemini-flash-lite-latest")` (`src/lib/config/env.ts:15`). Leaking the string `gemini-flash-lite-latest` harms nobody, so by the "would leaking this hurt?" gate it is not a secret and does not belong in `.env`. The repo already makes the opposite choice for the same class of value one directory over: `src/lib/config/byok.ts` holds `DEFAULT_BYOK_MODEL` and the `BYOK_MODELS` allowlist as committed constants, with the identical default value (`byok.ts:8`) and the identical "-latest alias, not a pinned version" rationale in its header comment (`byok.ts:3`) that `env.ts:14` repeats. So the same fact is now stated in two places, one of which can drift per-environment without review. `createGeminiClient` picks between them by path — `env.LLM_MODEL` for hosted, the allowlisted BYOK model otherwise (`gemini.client.ts:29`) — and unlike the BYOK side, the env-sourced value is validated against no allowlist at all.
- **Why it matters:** Two consequences. Configuration drift: staging and production can silently run different models, and a typo'd `LLM_MODEL` passes Zod, reaches Google, and 404s at request time — the exact failure the comment on `env.ts:14` warns about but does not prevent. Duplication: the model default now has two sources of truth to keep in sync.
- **Fix:** Move the server model id into committed config — either reuse `byok.ts`'s constants or add a tier-keyed entry alongside `src/lib/config/site.ts` — and delete `LLM_MODEL` from the schema and `.env.example`. If per-environment override is genuinely wanted, keep the var but validate it against the same allowlist `ALLOWED_BYOK_MODELS` uses (`gemini.client.ts:9`) so a bad value fails at boot.

### F5 — `.env.example` describes a contract the schema doesn't implement

- **What:** Three verified defects in the committed example (`.env.example`):
  1. A `# Required` comment sits above `LLM_MODEL` and `GOOGLE_API_KEY`, but the schema makes `GOOGLE_API_KEY` `.optional()` (`env.ts:11`) and `LLM_MODEL` `.default(...)` (`env.ts:15`) — neither is required, and nothing fails if both are absent. The doc comment on `env.ts:27` states the real contract ("all optional so the app builds without them"), directly contradicting the example.
  2. The Google key link points to `https://console.cloud.google.com/apis/credentials`, but a Gemini key for this app comes from AI Studio — the app's own copy sends users to `AI_STUDIO_KEYS_URL` = `https://aistudio.google.com/api-keys` (`src/lib/config/site.ts`), and the BYOK error text says "create a new free key … in Google AI Studio" (`errors.utils.ts:76`). The example sends a new contributor to the wrong console.
  3. Typo: `# Googe API keys`.

  The example is otherwise in good shape and tracks the schema 1:1 — all nine vars present (`APP_ENV` and the two per-tool key overrides as commented lines), no dead vars, no name drift, and placeholder-only values (`""` throughout, no real credential), with `openssl rand -hex 32` given for `IP_HASH_SECRET`.

- **Why it matters:** `.env.example` is the only env documentation a contributor or a future deploy reads. Marking optional vars "Required" trains people to ignore it, and the wrong provider console is a concrete dead end during setup — for the one credential the app most needs.
- **Fix:** Relabel the `# Required` block to reflect what each var actually does when unset (`GOOGLE_API_KEY` unset → hosted tools unavailable, BYOK still works), point the link at `https://aistudio.google.com/api-keys` to match `site.ts`, fix the typo, and uncomment `APP_ENV` per F1. **Coverage gap:** the local `.env.local` exists and is correctly gitignored, but this sandbox denied all reads of it, so the "no local extras" check (vars set locally that are absent from the schema/example) could not be performed — **needs confirmation** by the developer.

### F6 — No minimum length on any secret, so an empty string validates as configured

- **What:** Every secret is `z.string().optional()` with no `.min(1)` (`src/lib/config/env.ts:11-13`, `17-18`, `21`, `24`), and `.env.example` ships each one as `""`. An empty value therefore parses as _present_ rather than absent. In practice this degrades safely everywhere, which is why this is LOW and not higher — I traced all five consumers: `resolvePlatformApiKey` returns `""`, which `createGeminiClient` treats as falsy and converts into a thrown `NO_SERVER_KEY` (`gemini.client.ts:17-22`); `getRedis` short-circuits on `if (!url || !token)` (`rate-limit.utils.ts:29`); `IP_HASH_SECRET` falls through to plain SHA-256 and _does_ trigger the production warning (`rate-limit.utils.ts:53`, `70-73`); `SENDER_API_TOKEN` hits the `if (!token)` branch (`newsletter.action.ts:36`); and the per-tool keys are explicitly `.trim()`-ed with a comment noting that env files often set them to `""` (`api-key.utils.ts:5-7`). So the safety comes entirely from five independent falsy-checks downstream, not from the schema.
- **Why it matters:** The schema currently guarantees nothing about these values, so correctness depends on every future consumer remembering the same falsy-check. The sixth consumer that writes `if (env.SOME_TOKEN !== undefined)` gets a live bug that Zod should have caught at boot.
- **Fix:** Add `.min(1)` to each secret (`z.string().min(1).optional()`) so an empty string is a boot error, and let the downstream `undefined` checks be the single mechanism for "absent".

### F7 — CI documents an env contract that doesn't exist

- **What:** The build job's `env` block (`.github/workflows/ci.yml:77-82`) comments: "env.ts validates required vars at module load via Zod. Missing GOOGLE_API_KEY fails the build with a Zod error." Neither sentence is true — `GOOGLE_API_KEY` is `.optional()` (`env.ts:11`), so removing `GOOGLE_API_KEY: ci-placeholder-key` would not fail the build. The same comment names "Cloudflare Analytics" as an optional integration; the app uses umami (`src/app/layout.tsx:77-81`) and has no Cloudflare Analytics anywhere in the repo. The injected value is a harmless literal placeholder, not a credential.
- **Why it matters:** Stale CI comments are how the F1/F2 class of misconfiguration survives review — the next person reads this block and reasonably concludes boot-time validation has production coverage it does not have. It also masks the fact that CI never exercises the app with `APP_ENV=production`.
- **Fix:** Correct or delete both comments; drop the placeholder if nothing needs it. Better: once F1/F2 land, add a CI step that boots with `APP_ENV=production` and asserts the new production assertions actually fire, so the contract is tested rather than described.

### F8 — Non-secret tier config as inline literals

- **What:** Two committed non-secret ids sit as bare literals at their use sites rather than in a config module: the umami `data-website-id` (`src/app/layout.tsx:80`) and `SENDER_GROUP_IDS = ["b6VOlQ", "dw5jLr"]` (`src/lib/server/actions/newsletter.action.ts:12`). Being committed rather than env-held is the _right_ call for both — neither is a secret — and `src/lib/config/site.ts` is the established home for exactly this kind of value (`SITE_URL`, `CREATOR_*`, `AI_STUDIO_URL`, and so on). Neither is currently keyed off `APP_ENV`, so a staging deploy writes to the same analytics property and the same production subscriber groups as production.
- **Why it matters:** Minor and defense-in-depth, but it's the one place where per-tier values aren't tier-aware: preview and production traffic mix in one analytics property, and a test signup from a preview branch lands in the real newsletter list.
- **Fix:** Move both into the committed config layer alongside `site.ts`, keyed off `APP_ENV` if separate staging destinations are wanted.

### F9 — Provider error objects logged verbatim on key-carrying paths

- **What:** `toUserMessage` logs the raw error before mapping it — `console.error(\`[${opts.logTag}]\`, error)` (`src/lib/server/utils/ai/errors.utils.ts:16`) — and the same pattern appears at `rate-limit.utils.ts:105`and`newsletter.action.ts:80`, `87`. For AI SDK errors this serializes provider metadata (url, request body values, response headers). **Needs confirmation:** I could not read `node_modules/@ai-sdk/google`in this sandbox to establish whether the Gemini key travels as an`x-goog-api-key`header (excluded from`APICallError`'s captured fields) or in the request URL (which would put a key — including a *user's* BYOK key — into server logs). Treat the severity as provisional pending that check. Worth stating plainly: the *client-facing* side of this file is exemplary — every branch returns a hand-written string and the raw message never reaches the browser (`errors.utils.ts:32-102`), which is why this is a logging concern only.
- **Why it matters:** If the key is in the captured URL, hosted-platform logs accumulate credentials, and BYOK keys — which the app promises never leave the user's browser session (`byok.utils.ts:2`, `30`) — would be retained server-side, breaking that promise. OWASP A09.
- **Fix:** Confirm the provider's transport, then log a redacted projection (name, status, code, tool tag) instead of the whole error object, and add a redaction helper so future log sites inherit it.

## What was applied

### F1 — FIXED: quota enforcement no longer depends on `APP_ENV`

`getRedis()` gated on `isProduction`, so an unset `APP_ENV` (the schema's own default) meant no metering. Rather than making the tier required — which would break `pnpm dev` for contributors and force `APP_ENV` into CI — the dependency was removed: metering now follows the **credentials**, exempting only the dev server (`NODE_ENV === "development"`). Consequences, all intended:

- A deploy missing `APP_ENV` still meters, because the Upstash credentials are what matter.
- **Preview deploys are now metered too**, closing the "public previews are uncapped" half of this finding.
- Local development needs no Upstash account, exactly as before.

`APP_ENV` keeps its default and remains the switch for analytics and the `IP_HASH_SECRET` warning — tier-shaped concerns where a permissive default is harmless.

### F2 — FIXED: missing credentials now refuse hosted work instead of allowing it

`enforceDailyQuota` throws `QUOTA_UNAVAILABLE` when metering isn't live, mapped in `errors.utils.ts` to a message that points the user at BYOK. A boot-time `console.error` also fires when a platform key is configured without Upstash credentials, since the per-request symptom is otherwise indistinguishable from working.

The per-request `catch` still fails **open** on a Redis error, which is deliberate and unchanged: a transient Upstash blip shouldn't block a legitimate request. The distinction this finding asked for now exists — a _transient failure_ is tolerated, a _missing configuration_ is refused.

### F3 — FIXED: `UPSTASH_REDIS_REST_URL` is `z.string().url()`

A scheme-less or truncated paste fails once at boot instead of once per request inside the fail-open catch.

### F4 — FIXED: `LLM_MODEL` removed from env

The hosted model is now `HOSTED_LLM_MODEL` in `src/lib/config/byok.ts`, beside the BYOK model union and allowlist that already encoded the same value and the same "-latest alias" rationale. One source of truth, reviewed in git, and no longer able to drift per environment or reach Google as an unvalidated string. Deleted from the schema; the var can be removed from the host config at leisure (an unread env var is harmless).

### F5 — FIXED (applied by the maintainer): `.env.example` corrected

Permissions here deny both reading and writing `.env*`, so the corrected content was handed over and the maintainer confirmed applying it: `Googe` → `Google`, the key link repointed from `console.cloud.google.com/apis/credentials` to `aistudio.google.com/api-keys` (matching `AI_STUDIO_KEYS_URL`), the inaccurate `# Required` block replaced with per-var "what happens when unset" notes, `LLM_MODEL` removed per F4, `APP_ENV` uncommented as `development`, and a note that a deployed app now needs Upstash credentials for hosted AI.

Recorded as applied on the maintainer's confirmation — this session cannot read the file back to verify it, which is worth knowing if a future audit finds drift here.

Minor residual, folded into the backlog: `.env.local` was never readable, so "no local vars absent from the schema" stays unverified. It is now partly self-enforcing — an unknown var is ignored, and a malformed known one fails at boot.

### F6 — FIXED: empty strings can no longer read as "configured"

Each secret is `z.preprocess(emptyAsAbsent, z.string().min(1).optional())`.

**Deviation from the recommendation, deliberately.** The report asked for a plain `.min(1)` so `""` becomes a boot error. Applied as written, that broke the build immediately — the local env, following `.env.example`'s own `KEY=""` placeholders, failed validation on three vars. Failing a live boot over a placeholder is worse than the bug: in practice `KEY=""` means "not configured". Normalizing empty to `undefined` first delivers the finding's actual goal — no consumer can ever observe `""`, so a future `!== undefined` check is safe — without making the universal env-file convention a deployment hazard.

### F7 — FIXED: CI env comments corrected

The block no longer claims `GOOGLE_API_KEY` is required or names a non-existent Cloudflare Analytics integration; it states why a placeholder key is supplied. (Applied alongside the `paths-filter` fix in the same file.)

### F8 — FIXED: inline third-party ids moved to committed config

`UMAMI_WEBSITE_ID` and `SENDER_GROUP_IDS` now live in `src/lib/config/site.ts` with a comment noting they point at the production property in every tier, and where to split them if a staging destination is ever wanted.

### F9 — FIXED: provider errors are logged as a redacted projection

`toUserMessage` logs `{ name, message, statusCode, url, responseBody, finishReason }` with anything key-shaped stripped (`AIza…` tokens and `key=` / `api_key=` query params), and `responseBody` truncated to 500 chars.

The provider's key transport could not be confirmed (`node_modules` reads denied), so this was fixed **defensively rather than conditionally** — the redaction holds whichever transport the SDK uses, and matters most on the BYOK path, where the key is the user's and the app promises it never leaves their browser session.

## Scorecard

| Category                       | Score | Δ   | Notes                                                                                                                                                                                                                                                               |
| ------------------------------ | ----- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Validation                     | 9/10  | +3  | `.url()` on the Redis URL, `.min(1)` on every secret behind empty-as-absent normalization, and `process.env` still read at exactly one module. Short of 10 only because `APP_ENV` retains a default (deliberate — cost control no longer depends on it).            |
| Completeness                   | 9/10  | +1  | The example now states what each var does when unset instead of mislabelling optional vars "Required", points at the correct AI Studio console, and no longer lists the removed `LLM_MODEL` (F5). Short of 10 only because `.env.local` contents remain unverified. |
| Public vs server               | 10/10 | —   | No `NEXT_PUBLIC_*` vars; `env.ts` is `server-only`; no client module reaches it.                                                                                                                                                                                    |
| Secret leak                    | 10/10 | +1  | History still clean, and the last gap — verbatim provider-error logging — is closed by redacted projections (F9).                                                                                                                                                   |
| Tiering                        | 9/10  | +3  | Cost control no longer hinges on the tier at all (F1), and both classes of inline tier config moved into reviewed config (F4, F8). `APP_ENV` still defaults permissive, which is now low-consequence rather than load-bearing.                                      |
| Cross-app / parity consistency | 9/10  | +1  | CI comments now describe the real contract (F7). Still no in-repo deploy config to spot-check host values against.                                                                                                                                                  |

## Remaining action items

### Completed hand-offs

| #   | Task                                                      | Outcome                                          |
| --- | --------------------------------------------------------- | ------------------------------------------------ |
| 1   | Apply the corrected `.env.example` (F5)                   | Applied by the maintainer                        |
| 2   | Confirm Upstash credentials are set on the live host (F2) | Confirmed set — hosted AI will meter, not refuse |

### Backlog

| #   | Priority | Task                                                                                                                                    | Effort |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 4   | P3       | Add a CI step that boots with `APP_ENV=production` and asserts the fail-closed path fires, so the contract is tested not described (F7) | S      |
| 5   | P3       | Split `UMAMI_WEBSITE_ID` / `SENDER_GROUP_IDS` per tier if a staging analytics property and test subscriber group are ever wanted (F8)   | S      |
| 6   | P3       | Drop the now-unused `LLM_MODEL` from the Vercel env, and check `.env.local` for vars absent from the schema (F4, F5)                    | XS     |

## Resolved since last audit

First run of the fix pass. All nine findings closed — eight in code, F5 applied by the maintainer. The two HIGH findings are closed structurally — hosted generations can no longer run unmetered regardless of how `APP_ENV` is configured — which also closes the fail-open half of `redis-audit` F1/F2 and part of `security-audit`'s rate-limiting MEDIUM. Those will be marked in their own passes.
