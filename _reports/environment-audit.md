# Environment audit — The Productivity Bug

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `feat/the-productivity-bug` · **Scope:** whole repo — `src/lib/config/env.ts`, `.env.example`, `.gitignore`, all `process.env` call sites, server actions/services/utils that consume secrets, CI config, and full git history (210 commits) · **Overall:** 7/10

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | N/A      | 7/10    | N/A | N/A   |

First run — no prior `_reports/environment-audit.md`, so every finding is `NEW` and there is no "Resolved since last audit" section.

## Findings

| ID  | Severity | Category           | Status | Issue                                                                                                                                        | Location                                                                  |
| --- | -------- | ------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1   | HIGH     | Tiering            | NEW    | `APP_ENV` defaults to the permissive tier, so an unset var silently disables every production cost control                                   | `src/lib/config/env.ts:9`                                                 |
| 2   | HIGH     | Validation         | NEW    | Upstash vars are optional with no production assertion and a fail-open path — quota enforcement can be absent in production with no signal   | `src/lib/config/env.ts:17`                                                |
| 3   | MEDIUM   | Validation         | NEW    | `UPSTASH_REDIS_REST_URL` is a bare `z.string()` where a URL is meant                                                                         | `src/lib/config/env.ts:17`                                                |
| 4   | MEDIUM   | Tiering            | NEW    | `LLM_MODEL` is non-secret tier config living in env, duplicating committed model constants                                                   | `src/lib/config/env.ts:15`                                                |
| 5   | MEDIUM   | Completeness       | NEW    | `.env.example` documents a contract the schema doesn't implement ("Required" vars that are optional) plus a wrong key-console URL and a typo | `.env.example:5-10`                                                       |
| 6   | LOW      | Validation         | NEW    | No `.min(1)` on any secret — an empty string validates as "set"                                                                              | `src/lib/config/env.ts:11-24`                                             |
| 7   | LOW      | Cross-app / parity | NEW    | CI `env` block asserts a Zod failure that cannot happen and names an integration that doesn't exist                                          | `.github/workflows/ci.yml:77-82`                                          |
| 8   | LOW      | Tiering            | NEW    | Analytics website id and Sender group ids are inline literals rather than tier-keyed committed config                                        | `src/app/layout.tsx:80`, `src/lib/server/actions/newsletter.action.ts:12` |
| 9   | LOW      | Secret leak        | NEW    | Full provider error objects are logged verbatim on paths that carry an API key — needs confirmation                                          | `src/lib/server/utils/ai/errors.utils.ts:16`                              |

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

## Scorecard

| Category                       | Score | Notes                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Validation                     | 6/10  | Zod parses at module load in a leaf module importing only `zod` + `server-only`, and `process.env` appears at exactly nine sites, all inside `env.ts` — zero raw reads anywhere else in the repo. But every var is `.optional()` or `.default()`, with no `.url()` and no `.min(1)`, so almost nothing can actually fail fast (F2, F3, F6).                  |
| Completeness                   | 8/10  | Example tracks the schema 1:1 with placeholder-only values and helpful generation hints; loses points for the "Required"-vs-optional contradiction, the wrong key-console URL, and a typo (F5). `.env.local` var names were unreadable in this sandbox.                                                                                                      |
| Public vs server               | 10/10 | No `NEXT_PUBLIC_*` vars exist at all; `env.ts` carries `import "server-only"`; all seven `@env` importers are server-side (layout, actions, services, clients, server utils) and no `"use client"` module reaches it, so a leak is structurally prevented rather than merely avoided.                                                                        |
| Secret leak                    | 9/10  | Across 210 commits, `.env.example` is the only env/key file ever added, no `AIza…` / `PRIVATE KEY` / JWT / `*.upstash.io` string appears in any tracked blob in history, `.gitignore` covers `.env*` with `!.env.example`, `next.config.ts` has no `env` block, and every user-facing error string is hand-written. Only gap is verbatim error logging (F9). |
| Tiering                        | 6/10  | `APP_ENV` drives every tier decision and `NODE_ENV` appears nowhere in the repo — the house rule is followed exactly, and an invalid `APP_ENV` fails fast. Marked down because the tier defaults to the permissive value (F1) and two classes of tier config live outside tier-keyed config (F4, F8).                                                        |
| Cross-app / parity consistency | 8/10  | Single app, so no cross-app name/shape drift is possible, and `site.ts` centralizes derived URLs well. The CI env block asserts a validation contract the schema doesn't implement (F7), and no deploy config is in-repo to spot-check `APP_ENV` against (F1).                                                                                               |

## Action items

### Fix Now

| #   | Priority | Task (finding ID)                                                                                                                        | Effort |
| --- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Confirm `APP_ENV=production` is set in the live host config; make the tier explicit in the schema so it can't default to permissive (F1) | S      |
| 2   | P0       | Add a production boot assertion that fails when a platform Gemini key is set but Upstash credentials are absent (F2)                     | S      |
| 3   | P1       | Type `UPSTASH_REDIS_REST_URL` as `z.string().url()` (F3)                                                                                 | XS     |

### Next Release

| #   | Priority | Task (finding ID)                                                                                     | Effort |
| --- | -------- | ----------------------------------------------------------------------------------------------------- | ------ |
| 4   | P1       | Fix `.env.example` — real optional/required labels, AI Studio key URL, typo, uncomment `APP_ENV` (F5) | XS     |
| 5   | P2       | Move `LLM_MODEL` into committed config (or allowlist-validate it) and drop the duplicate default (F4) | S      |
| 6   | P2       | Add `.min(1)` to every secret so `""` is a boot error (F6)                                            | XS     |
| 7   | P2       | Confirm the Gemini provider's key transport, then log redacted error projections (F9)                 | S      |
| 8   | P3       | Correct the CI env comments; consider a CI boot check under `APP_ENV=production` (F7)                 | XS     |

### Backlog

| #   | Priority | Task (finding ID)                                                                                          | Effort |
| --- | -------- | ---------------------------------------------------------------------------------------------------------- | ------ |
| 9   | P3       | Move the umami website id and Sender group ids into tier-keyed committed config (F8)                       | S      |
| 10  | P3       | Verify `.env.local` holds no vars absent from the schema/example — unreadable in this audit's sandbox (F5) | XS     |

## Resolved since last audit

First run — nothing to compare against.
