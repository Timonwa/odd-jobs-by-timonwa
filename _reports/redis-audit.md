# Redis audit — the-productivity-bug (hosted AI-tool daily quotas)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `code-restructuring` · **Scope:** all `@upstash/redis` usage — `src/lib/server/utils/rate-limit.utils.ts`, `src/lib/server/utils/ai/quota.utils.ts`, `src/lib/config/env.ts`, the Server Actions in `src/lib/server/actions/`, and the quota constants in `src/lib/constants/` · **Overall:** 5/10

## Score change (previous → current)

| Metric  | Previous        | Current | Δ   | Trend |
| ------- | --------------- | ------- | --- | ----- |
| Overall | N/A (first run) | 5/10    | N/A | N/A   |

## Findings

| ID  | Severity | Category           | Status | Issue                                                                                                                                         | Location                                         |
| --- | -------- | ------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | HIGH     | Failure direction  | NEW    | The rate limiter fails OPEN on any Redis error — a Redis blip converts the daily cap into unlimited hosted LLM spend                          | `src/lib/server/utils/rate-limit.utils.ts:104`   |
| 2   | HIGH     | Connection hygiene | NEW    | Limiting silently no-ops whenever `APP_ENV` ≠ `production` or an Upstash var is missing — no boot assertion, no alert                         | `src/lib/server/utils/rate-limit.utils.ts:23`    |
| 3   | HIGH     | Missed opportunity | NEW    | The newsletter Server Action is unauthenticated, side-effecting against a third-party API, and has no rate limit                              | `src/lib/server/actions/newsletter.action.ts:23` |
| 4   | MEDIUM   | Atomicity / TTL    | NEW    | `incr` + `expire` is not atomic — a skipped or failed `expire` leaves a counter with no TTL, permanently                                      | `src/lib/server/utils/rate-limit.utils.ts:94`    |
| 5   | MEDIUM   | Atomicity          | NEW    | The per-user counter is burned by requests that never produce output (pool denial, LLM failure) — no decrement/refund                         | `src/lib/server/utils/rate-limit.utils.ts:94`    |
| 6   | MEDIUM   | Connection hygiene | NEW    | A new `Redis` client is constructed per call instead of one shared module-level client; auto-pipelining is off                                | `src/lib/server/utils/rate-limit.utils.ts:23`    |
| 7   | MEDIUM   | Key namespacing    | NEW    | Keys are inline template strings with a duplicated `ratelimit:` prefix — no central key-builder or TTL-preset module                          | `src/lib/server/utils/rate-limit.utils.ts:90`    |
| 8   | MEDIUM   | Missed opportunity | NEW    | No short-window burst limit — one actor can drain the 1,000/day shared pool in minutes, and the fixed daily window allows a 2× midnight burst | `src/lib/server/utils/rate-limit.utils.ts:33`    |
| 9   | LOW      | Cost               | NEW    | 2–4 sequential REST round-trips per generation; the two `incr`s and two `expire`s are never batched                                           | `src/lib/server/utils/rate-limit.utils.ts:94`    |
| 10  | LOW      | Security           | NEW    | Key segments are not encoded and `toolSlug` is typed as a free `string` — a future slug containing `:` could forge a namespace                | `src/lib/server/utils/rate-limit.utils.ts:11`    |
| 11  | LOW      | Connection hygiene | NEW    | Eviction policy and one-database-per-environment unverified; `.env.local` holds a live Upstash token dev never uses (needs confirmation)      | `.env.local:17`                                  |
| 12  | LOW      | Docs               | NEW    | `docs/tool-limits.md` documents the limiter at three paths that no longer exist                                                               | `docs/tool-limits.md:13`                         |

### F1 — The rate limiter fails OPEN on every Redis error

- **What:** `checkAndIncrementQuota` wraps the whole counter sequence in a `try/catch` that logs and returns `{ allowed: true, remaining: null }` (`rate-limit.utils.ts:104-107`); the intent is stated in the module comment at line 9 ("fails open so infra flakiness never blocks a real request"). Concrete case: Upstash returns 429/503, the REST call times out, the token is rotated, or the database is paused for quota — every subsequent hosted request is allowed with no counting at all, for as long as the condition lasts. Both callers (`enforceDailyQuota` → `generateSeoMeta` / `generateSocialPosts` and their regenerate twins) then proceed straight to the LLM call on the server's `GOOGLE_API_KEY`.
- **Why it matters:** This is the only cost control on the hosted tier — `docs/tool-limits.md` names the run caps as "the real cost control". A rate limiter has nothing behind it to degrade to, so failing open doesn't preserve a feature, it removes the control: an outage window becomes unbounded Gemini spend and unbounded free-tier consumption, and it is the exact window an abuser rotating IPs would exploit. The house `redis-patterns` standard is explicit — rate limits, locks, idempotency and dedup fail CLOSED; only caches fail open.
- **Fix:** Split the two failure modes. Keep "Redis not configured" as the allow path (F2 covers making that loud), but make a Redis _error_ deny: return `{ allowed: false, reason: "unavailable" }` and map it in `toUserMessage` to a "the free tier is temporarily unavailable — add your own free Google key to keep going" message. The BYOK escape hatch means denying costs the user nothing but a key paste, which is precisely why fail-closed is affordable here.

### F2 — Limiting silently no-ops when `APP_ENV` ≠ `production` or an Upstash var is missing

- **What:** `getRedis()` returns `null` when `!isProduction`, and again when either `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` is absent (`rate-limit.utils.ts:26-29`); every one of those vars is `.optional()` in the env schema (`src/lib/config/env.ts:17-18`), and `APP_ENV` defaults to `"development"` (line 9). Nothing asserts at boot that a production deploy actually has a limiter. Three real paths to zero enforcement: (a) `APP_ENV` not set on the production deploy — AGENTS.md already flags that it must be "set explicitly on deploy; unset = development"; (b) either Upstash var missing or typo'd in the deploy's env; (c) any Vercel preview deployment, which is public by default yet still runs the server `GOOGLE_API_KEY` with no cap.
- **Why it matters:** The failure is invisible — there is no error, no log, and the only signal is the navbar pill quietly reporting `configured: false` via `getRateLimitStatus`. This is the classic misconfiguration signature the standard calls out ("no rate-limit keys appear"), and here it means a public site serving paid LLM calls with no ceiling. Note there is one boot-time warning already (`IP_HASH_SECRET`, line 53) — the far more consequential "no limiter at all" case has none.
- **Fix:** Add a boot assertion in `env.ts` (or a module-level check beside the existing `IP_HASH_SECRET` warning): when `APP_ENV === "production"`, require both Upstash vars — throw, or at minimum `console.error` at a level your monitoring alerts on. Separately, decide preview deployments deliberately: either enable limiting for them (gate on "credentials present" rather than `APP_ENV === "production"`) or require BYOK there, rather than leaving the server key uncapped behind a public URL.

### F3 — The newsletter Server Action has no rate limit

- **What:** `subscribeNewsletter` (`newsletter.action.ts:23-93`) validates the email with Zod and then POSTs it to `https://api.sender.net/v2/subscribers` with the `SENDER_API_TOKEN`, subscribing it to two hard-coded groups. There is no quota check, no per-IP counter, no honeypot and no captcha — `grep -ri "honeypot\|captcha\|turnstile" src/` returns nothing. It is reachable from every page that renders `src/components/_shared/content/Newsletter.tsx`, and a Server Action endpoint can be called in a loop directly.
- **Why it matters:** Unlimited, unauthenticated writes to a third-party list: subscriber-list poisoning with junk addresses, a subscribe-bomb against arbitrary victim addresses (the site becomes the sender), and consumption of the Sender.net plan's subscriber/API budget. Each attempt is also a 10-second-timeout outbound fetch, so a loop consumes serverless execution time too. The app already owns exactly the primitive this needs.
- **Fix:** Reuse the existing helper — give the action its own quota namespace (e.g. `perUserDaily: 5`, plus a shared daily pool) and call `checkAndIncrementQuota` before the fetch, ideally on a short window (per-hour) rather than the daily one, since a legitimate visitor subscribes once. Fail closed here too (F1). Add a honeypot field as cheap defense-in-depth.

### F4 — `incr` + `expire` is not atomic, so a counter can end up with no TTL

- **What:** The TTL is applied in a separate command, conditionally on the counter being new: `const userCount = await redis.incr(userKey); if (userCount === 1) await redis.expire(userKey, ttl);` (`rate-limit.utils.ts:94-95`, and the identical pool pair at 98-99). If the `expire` never lands — the REST call fails and is swallowed by the outer catch at line 104, the function times out, or the serverless invocation is killed between the two awaits — the key exists with `TTL = -1`. Because the `expire` is gated on `=== 1`, no later request ever repairs it: every subsequent `incr` returns > 1 and skips the branch.
- **Why it matters:** A permanently un-expiring key per affected user-day and tool-day. Correctness within the day is unaffected (the key embeds the UTC date), but the keyspace then grows monotonically forever — the memory and cost leak the standard's TTL rule exists to prevent — and on a `noeviction` database an ever-growing keyspace eventually turns into write errors, which under F1 means silent fail-open.
- **Fix:** Make the write one atomic unit. Cleanest: replace the hand-rolled counters with `@upstash/ratelimit`'s sliding window, which manages its own keys and expiry (and also fixes F8 and F9). If you keep the hand-rolled version, do it in one round-trip that cannot half-apply — a `redis.eval` Lua script doing `INCR` then `EXPIRE … NX`, or `redis.multi().incr(key).expire(key, ttl, "NX").exec()`. The `NX` flag on `EXPIRE` makes the call idempotent, so you can set it unconditionally and drop the fragile `=== 1` gate.

### F5 — The per-user counter is burned by requests that never produce output

- **What:** The user counter is incremented first and the pool is checked second (`rate-limit.utils.ts:94-100`). Two consequences, both verifiable from the ordering: (a) once the 1,000/day shared pool is exhausted, every request still increments the caller's personal counter before being denied with `reason: "pool"` — a visitor can silently lose all 5–10 of their daily generations to requests that returned nothing; (b) the increment happens before the LLM call in every action (`seo-meta.action.ts:105`, `:144`; `social-posts.action.ts:158`, `:212`), and nothing decrements it when generation fails, so a Google 503, a content-filter block, a timeout, or a malformed object all consume quota. Note the converse asymmetry too: a user already over their own cap never increments the pool, which is correct.
- **Why it matters:** The user-facing message asserts "You've used up your 10 free generations for today" (`errors.utils.ts:38`) when the user may have received two results and eight errors. Pre-increment is the right call for cost protection (the token spend happens whether or not the response parses), so the defect is the absence of a compensating decrement, not the ordering itself.
- **Fix:** Check the pool before incrementing the user counter (`get` the pool, or reorder the increments so a pool denial doesn't charge the user). For LLM failures, `decr` the user key in the action's catch block for the error classes where no tokens were billed (source-resolution errors, timeouts before the call) — or, minimally, soften the copy so an exhausted allowance doesn't over-claim. Keep charging for content-filter and schema failures, where Google did bill.

### F6 — A new `Redis` client per call, and auto-pipelining off

- **What:** `getRedis()` runs `return new Redis({ url, token })` on every invocation (`rate-limit.utils.ts:30`). It is called once per `checkAndIncrementQuota` — i.e. per hosted generation — and again on every `getRateLimitStatus()` (line 112), which is itself a Server Action (`fetchSeoMetaUsage`, `fetchSocialPostsUsage`) invoked by the usage-notice components on mount, purely to derive a boolean and then discard the instance. `enableAutoPipelining` is never set.
- **Why it matters:** Upstash's REST transport is stateless, so this leaks no sockets — the impact is per-request allocation, no shared configuration point, and, more concretely, no place to enable `enableAutoPipelining`, which is what would collapse the concurrent commands in F9 into a single HTTP pipeline. The standard's rule is one module-level client, imported everywhere.
- **Fix:** Extract a single module (e.g. `src/lib/server/clients/redis.client.ts`) exporting one lazily-created client with `enableAutoPipelining: true`, and have `getRateLimitStatus` answer from the env/config check alone rather than by constructing a client.

### F7 — Inline key strings; no central key-builder or TTL-preset module

- **What:** Both keys are built as template literals at the call site — `` `ratelimit:${toolSlug}:user:${clientHash}:${date}` `` and `` `ratelimit:${toolSlug}:pool:${date}` `` (`rate-limit.utils.ts:90-91`) — so the `ratelimit:` prefix is duplicated and the keyspace is only greppable by that literal. The TTL is likewise computed inline with no named preset.
- **Why it matters:** This is the standard's first rule, and the repo already applies exactly this pattern to its _browser_ identifiers: `STORAGE_KEYS` in `src/lib/constants/storage-keys.constant.ts` built through `namespaced()`, with the comment "Add new keys here — never inline a raw string". The Redis keyspace is the one namespace exempted from the house convention, which is where drift starts as soon as a third AI tool or the newsletter limit (F3) needs a key.
- **Fix:** Add a `REDIS_KEYS` builder module (the only file where a Redis prefix appears) with `rateLimitUser(toolSlug, hash, date)` and `rateLimitPool(toolSlug, date)`, plus a `REDIS_TTL` constants object. The standard's grammar is a short `rl:` prefix; `ratelimit:` is fine if kept, as long as it lives in one place.

### F8 — No short-window burst limit; the daily window is fixed, not sliding

- **What:** The only windows are per-user-per-day and pool-per-day, both keyed on `todayUtc()` and expiring at UTC midnight (`rate-limit.utils.ts:33-51`). There is no per-minute or per-hour ceiling anywhere. Two consequences: an actor rotating IPs (or a botnet) can consume the entire 1,000-generation shared pool within minutes of midnight, since nothing paces consumption; and because the window is fixed rather than sliding, a single user can spend their full daily cap at 23:59 and again at 00:00 for a 2× burst in two minutes.
- **Why it matters:** The daily pool bounds _cost_, and that bound holds. What it does not bound is _availability_: `docs/tool-limits.md` positions the pool as "the spike backstop", but with no pacing the backstop can be drained by one actor early each day, leaving every genuine visitor with the "shared free daily limit is used up" message for the remaining 23 hours. The standard prescribes sliding windows precisely because fixed ones stack at the boundary.
- **Fix:** Add a short second tier on top of the daily caps — a per-IP sliding window (e.g. 5/minute) and optionally a pool-level per-minute pace. `@upstash/ratelimit`'s `slidingWindow` gives both this and F4's atomicity; construct limiter instances once at module level, not per request.

### F9 — 2–4 sequential REST round-trips per generation

- **What:** The happy path awaits `incr(userKey)` then `incr(poolKey)` sequentially, plus up to two `expire` calls on the first request of a day (`rate-limit.utils.ts:94-99`) — 2 round-trips normally, 4 on the day's first request, each a full HTTP request under Upstash's REST transport, all serialized before the LLM call starts.
- **Why it matters:** The standard's budget is roughly ≤3 Redis round-trips per request path, and the two `incr`s are independent so nothing requires them to be sequential. The absolute cost is small next to a multi-second Gemini call, which is why this is LOW — but it is also billed per command on Upstash and adds latency to the user's first byte.
- **Fix:** Batch them — one `redis.pipeline()` for the fixed set of commands, or `Promise.all` with `enableAutoPipelining: true` (F6). Folding the increment and expiry into one Lua `eval` per counter (F4) reduces the whole path to two commands, or one pipeline.

### F10 — Key segments are not encoded, and `toolSlug` is an unconstrained `string`

- **What:** None of the three interpolated segments is encoded (`rate-limit.utils.ts:90-91`). Today this is not exploitable: `clientHash` is 16 hex chars from an HMAC/SHA-256 digest (line 74), `date` is `toISOString().slice(0, 10)`, and `toolSlug` comes from two hard-coded literals (`seo-meta.action.ts:27`, `social-posts.action.ts:36`). But `QuotaConfig.toolSlug` is typed as a bare `string` (line 12), so nothing structurally prevents a future tool from passing a slug containing `:` and colliding with, or forging, another namespace's counter (e.g. a slug ending `:user:<hash>` reading as another tool's pool key).
- **Why it matters:** Defense-in-depth only — hence LOW. Reported because the standard requires encoding on every segment derived from anything but a compile-time constant, and because the fix costs one function call.
- **Fix:** `encodeURIComponent` each interpolated segment inside the F7 key builders, and/or narrow `toolSlug` to a union of the registered tool slugs from `src/lib/config/tools.ts`.

### F11 — Eviction policy and per-environment database unverified (needs confirmation)

- **What:** Nothing in the repo pins the Upstash database's eviction policy — there is no IaC, and no note in `README.md` or `docs/tool-limits.md`. Separately, `.env.local` contains a live-looking `UPSTASH_REDIS_REST_URL` / `_TOKEN` pair (lines 17-18) that local development never uses, because `getRedis()` returns `null` unless `APP_ENV === "production"`; whether that instance is the same one production points at cannot be determined from the repo. (`.env.local` is correctly gitignored — `.gitignore:34` — and `git ls-files` confirms only `.env.example` is tracked, so no secret is committed.)
- **Why it matters:** A database holding rate-limit counters must run `noeviction`, so memory pressure produces loud write errors rather than silently deleting the key that was capping spend — and under F1 a silent deletion is indistinguishable from a fresh counter. Sharing one database across environments is the other half of the "429 never fires" misconfiguration. Both are configuration facts outside the code, so this is flagged for confirmation rather than asserted.
- **Fix:** Confirm in the Upstash console that the production database has eviction disabled and that dev/preview/prod use separate databases and credentials; record both in `docs/tool-limits.md`. Remove the unused Upstash credentials from `.env.local` (or point them at a dev-only database) so a dormant production token isn't sitting on a laptop.

### F12 — `docs/tool-limits.md` documents the limiter at paths that no longer exist

- **What:** The enforcement section (line 13) links the limiter to `lib/rate-limit/index.ts` and `lib/utils/ai/quota.ts`, and the constants to `lib/constants/article.ts`; the actual files are `src/lib/server/utils/rate-limit.utils.ts`, `src/lib/server/utils/ai/quota.utils.ts` and `src/lib/constants/article.constant.ts`. It also names the constants `HOSTED_PER_USER_DAILY` / `HOSTED_DAILY_GENERATION_POOL` and `MAX_ARTICLE_CHARS`, none of which exist (they are `SEO_META_DAILY_USER_CAP`, `SEO_META_DAILY_SHARED_POOL`, `MAX_ARTICLE_INPUT_CHARS` and their social-post equivalents), and refers to a `QuotaConfigType` where the exported type is `QuotaConfig`.
- **Why it matters:** This is the only document describing the Redis-backed quota system, and it is the file a future contributor reads before adding a tool's caps. Stale paths and non-existent identifiers make it actively misleading. (Note also that `QuotaConfig` / `QuotaCheckResult` / `RateLimitStatus` don't carry the `…Type` suffix AGENTS.md mandates for exported types — a conventions matter rather than a Redis one.)
- **Fix:** Update the paths and identifier names in `docs/tool-limits.md` to match the post-restructure layout.

## Scorecard

| Category             | Score | Notes                                                                                                                                                                                                                                                                                                                               |
| -------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Key namespacing      | 5/10  | Consistent, well-shaped `ratelimit:<tool>:<scope>:…:<date>` keys confined to one file, but built as inline templates with a duplicated prefix and no builder module — while the repo already enforces exactly that pattern for browser keys (F7, F10).                                                                              |
| TTL discipline       | 6/10  | Every key gets a TTL sized correctly to the job (seconds to UTC midnight, with a sensible 60 s floor), but the TTL can be skipped permanently and no later request repairs it (F4); no shared TTL presets.                                                                                                                          |
| Atomicity            | 5/10  | `INCR` is the right primitive and there is no read-modify-write anywhere, but the increment and its expiry are two un-batched commands (F4) and the user counter is charged before the pool is checked with no compensating decrement (F5).                                                                                         |
| Connection hygiene   | 4/10  | Credentials come from a validated `env` object in a `server-only` module, but a client is constructed per call (F6), enforcement disappears silently on any misconfiguration with no boot assertion (F2), and eviction policy / per-env isolation are unverified (F11).                                                             |
| Cost                 | 6/10  | No `KEYS`, no `FLUSH*`, no unbounded range reads, no loops — just 2–4 sequential round-trips that should be one pipeline, and a client built per usage-pill call (F9, F6).                                                                                                                                                          |
| Missed opportunities | 5/10  | Correctly skips caching, locking and dedup — none apply here. But the newsletter action is an unauthenticated third-party write with no limit (F3), and the daily-only fixed windows leave no burst protection (F8).                                                                                                                |
| Security             | 6/10  | Strong on the parts most apps get wrong: HMAC-peppered IP hashes with a production warning when the pepper is unset, correct rightmost-`x-forwarded-for` / `x-real-ip` handling, no secrets in keys or values, server-only surface, no committed credentials. Undercut by the fail-open contract (F1) and unencoded segments (F10). |

## Action items

Tiers: `production` → **Fix Now / Next Release / Backlog**.

### Fix Now

| #   | Priority | Task (finding ID)                                                                                                                           | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Make Redis errors deny instead of allow; keep "not configured" as the only allow path, with a BYOK-pointing message (F1)                    | S      |
| 2   | P0       | Assert at boot that a production deploy has both Upstash vars, and decide preview-deployment enforcement explicitly (F2)                    | S      |
| 3   | P0       | Rate-limit `subscribeNewsletter` with the existing quota helper on a short window; add a honeypot (F3)                                      | S      |
| 4   | P1       | Confirm the production Upstash database runs `noeviction` and is not shared with dev/preview; drop the unused token from `.env.local` (F11) | S      |

### Next Release

| #   | Priority | Task (finding ID)                                                                                                                            | Effort |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 5   | P1       | Make increment + expiry atomic — `@upstash/ratelimit` sliding window, or one `eval` / `multi` with `EXPIRE … NX`; drop the `=== 1` gate (F4) | M      |
| 6   | P1       | Check the shared pool before charging the user counter, and decrement on failures where no tokens were billed (F5)                           | M      |
| 7   | P2       | Add a short per-IP burst window on top of the daily caps (F8)                                                                                | M      |
| 8   | P2       | Extract one shared module-level Redis client with `enableAutoPipelining`; make the usage pill answer from config alone (F6, F9)              | S      |

### Backlog

| #   | Priority | Task (finding ID)                                                                        | Effort |
| --- | -------- | ---------------------------------------------------------------------------------------- | ------ |
| 9   | P2       | Add a `REDIS_KEYS` builder module and `REDIS_TTL` presets, mirroring `STORAGE_KEYS` (F7) | S      |
| 10  | P3       | Encode key segments and narrow `toolSlug` to the registered tool slugs (F10)             | S      |
| 11  | P3       | Correct the stale paths and identifier names in `docs/tool-limits.md` (F12)              | S      |

## Resolved since last audit

First run — no previous report at `_reports/redis-audit.md`.
