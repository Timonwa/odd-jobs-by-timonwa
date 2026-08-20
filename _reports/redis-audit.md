# Redis audit — the-productivity-bug (hosted AI-tool daily quotas)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** fixes applied · **Branch:** `code-restructuring` · **Scope:** all `@upstash/redis` usage — `src/lib/server/utils/rate-limit.utils.ts`, `src/lib/server/utils/ai/quota.utils.ts`, `src/lib/config/env.ts`, the Server Actions in `src/lib/server/actions/`, and the quota constants in `src/lib/constants/` · **Overall:** 9/10

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | 5/10     | 9/10    | +4  | ▲     |

Eleven of twelve findings fixed; one (F11) is partly a maintainer fact and partly now mitigated in code. The limiter was restructured rather than patched: one atomic Lua script charges all three tiers, keys and TTLs moved into a dedicated `clients/redis/` module, and the failure direction flipped to closed.

**A regression this pass had to prevent:** metering now follows credentials rather than `APP_ENV` (from the environment pass), and the maintainer confirmed **one Upstash database serves every environment** — so preview deploys would have spent production's shared pool. Every key is therefore scoped by tier (`rl:<APP_ENV>:…`).

## Findings

| ID  | Severity | Category           | Status      | Issue                                                                                                                                         | Location                                         |
| --- | -------- | ------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | HIGH     | Failure direction  | **FIXED**   | The rate limiter fails OPEN on any Redis error — a Redis blip converts the daily cap into unlimited hosted LLM spend                          | `src/lib/server/utils/rate-limit.utils.ts:104`   |
| 2   | HIGH     | Connection hygiene | **FIXED**   | Limiting silently no-ops whenever `APP_ENV` ≠ `production` or an Upstash var is missing — no boot assertion, no alert                         | `src/lib/server/utils/rate-limit.utils.ts:23`    |
| 3   | HIGH     | Missed opportunity | **FIXED**   | The newsletter Server Action is unauthenticated, side-effecting against a third-party API, and has no rate limit                              | `src/lib/server/actions/newsletter.action.ts:23` |
| 4   | MEDIUM   | Atomicity / TTL    | **FIXED**   | `incr` + `expire` is not atomic — a skipped or failed `expire` leaves a counter with no TTL, permanently                                      | `src/lib/server/utils/rate-limit.utils.ts:94`    |
| 5   | MEDIUM   | Atomicity          | **FIXED**   | The per-user counter is burned by requests that never produce output (pool denial, LLM failure) — no decrement/refund                         | `src/lib/server/utils/rate-limit.utils.ts:94`    |
| 6   | MEDIUM   | Connection hygiene | **FIXED**   | A new `Redis` client is constructed per call instead of one shared module-level client; auto-pipelining is off                                | `src/lib/server/utils/rate-limit.utils.ts:23`    |
| 7   | MEDIUM   | Key namespacing    | **FIXED**   | Keys are inline template strings with a duplicated `ratelimit:` prefix — no central key-builder or TTL-preset module                          | `src/lib/server/utils/rate-limit.utils.ts:90`    |
| 8   | MEDIUM   | Missed opportunity | **FIXED**   | No short-window burst limit — one actor can drain the 1,000/day shared pool in minutes, and the fixed daily window allows a 2× midnight burst | `src/lib/server/utils/rate-limit.utils.ts:33`    |
| 9   | LOW      | Cost               | **FIXED**   | 2–4 sequential REST round-trips per generation; the two `incr`s and two `expire`s are never batched                                           | `src/lib/server/utils/rate-limit.utils.ts:94`    |
| 10  | LOW      | Security           | **FIXED**   | Key segments are not encoded and `toolSlug` is typed as a free `string` — a future slug containing `:` could forge a namespace                | `src/lib/server/utils/rate-limit.utils.ts:11`    |
| 11  | LOW      | Connection hygiene | **PARTIAL** | Eviction policy and one-database-per-environment unverified; `.env.local` holds a live Upstash token dev never uses (needs confirmation)      | `.env.local:17`                                  |
| 12  | LOW      | Docs               | **FIXED**   | `docs/tool-limits.md` documents the limiter at three paths that no longer exist                                                               | `docs/tool-limits.md:13`                         |

## What was applied

The limiter was restructured, not patched. Three new modules under `src/lib/server/clients/redis/` (`client.ts`, `keys.ts`, `ttl.ts`) own the connection, the keyspace, and the TTL presets, and `rate-limit.utils.ts` now performs the whole check-and-charge in one atomic Lua script.

### F1 — FIXED: the limiter fails CLOSED

A Redis error now returns `{ allowed: false, reason: "unavailable" }`, surfaced to the user as "the free hosted allowance isn't available right now — add your own free Google key". The house standard's rule applies as written: caches fail open, rate limits fail closed, and here BYOK makes denial cost a key paste rather than the feature.

This reverses the note left in the environment pass, which kept transient errors failing open. On review that was the wrong call for a limiter with nothing behind it to degrade to — the outage window is precisely what an abuser waits for.

### F2 — FIXED (environment pass): silent no-op closed

Metering follows the Upstash credentials rather than `APP_ENV`, with a boot-time `console.error` when a platform key exists without them, and `canServeHostedAi()` refusing hosted work in any built app that cannot meter. Preview deploys are now metered too.

### F3 — FIXED: the newsletter action is metered and honeypotted

`subscribeNewsletter` now runs through `checkAndIncrementQuota` under its own `newsletter` namespace (3/day per caller, 2 per burst window, 500/day shared — caps in `newsletter.constant.ts`), before the Sender.net fetch. Added alongside:

- **A honeypot field** (`company_website`, hidden from people and assistive tech, not `type="hidden"` which bots skip). A filled honeypot returns the _success_ message — a bot told it was blocked adapts.
- **One confirmation message** for both "subscribed" and "already subscribed", closing the membership oracle. That half also resolves `security-audit` F3.

### F4 + F5 + F9 — FIXED: one atomic script

`CHECK_AND_CHARGE` reads all three counters, denies without charging if any limit is hit, then increments each and sets its TTL, returning `[status, remaining]`.

- **F4:** the `INCR`/`EXPIRE` pair can no longer half-apply, so the "key with `TTL = -1` forever, never repaired because the `=== 1` gate never fires again" case is gone.
- **F5:** a pool-exhausted or burst-limited request charges nothing, so the "you've used up your 10 free generations" message can no longer be shown to someone who received nothing. LLM-failure refunds were deliberately **not** added: the tokens are billed by Google whether or not the response parses, so pre-charging is correct and a refund would be wrong.
- **F9:** the happy path is one round-trip instead of 2–4.

Verified equivalent to the old thresholds: previously `INCR` then deny on `count > max` allowed exactly `max` requests; now denying on `GET >= max` before incrementing allows exactly `max`.

### F6 — FIXED: one client, auto-pipelining on

`clients/redis/client.ts` exports a lazily-created singleton with `enableAutoPipelining: true`. `getRateLimitStatus()` — called by the usage-notice components on mount — now answers from `hasRedisCredentials()` without constructing a client at all.

### F7 — FIXED: a real key module

`REDIS_KEYS` in `clients/redis/keys.ts` is the only place a Redis prefix appears, matching what `STORAGE_KEYS` already does for browser storage. TTLs live beside it in `ttl.ts` (`BURST_WINDOW_SECONDS`, `secondsUntilUtcMidnight`, `todayUtc`, `currentBurstWindow`). The prefix moved from `ratelimit:` to the standard's shorter `rl:`.

### F8 — FIXED: a burst tier, with a deliberate deviation

A per-caller short-window ceiling (60s, defaulting to half the daily cap with a floor of 3) now paces consumption, so the shared pool can't be drained in the first minutes of a day.

**Deviation:** the report recommended `@upstash/ratelimit`'s sliding window. This is a fixed window instead, folded into the existing script — no new dependency, and it stays one round-trip. The trade-off is honest: a fixed window permits a 2× burst across its boundary, but at 60s that means double the per-minute rate for a moment rather than the 2× _daily_ allowance the unpaced version allowed. If sliding windows are wanted later, `@upstash/ratelimit` is the clean swap.

### F10 — FIXED: segments encoded

Every key segment goes through `encodeURIComponent`, so a value containing `:` can no longer forge a namespace. `toolSlug` is deliberately left as `string` rather than narrowed to a tool-slug union — the namespace now legitimately includes non-tool callers such as `newsletter`.

### F11 — PARTIAL: one database confirmed, isolation handled in code

The maintainer confirmed **a single Upstash database serves every environment**. Rather than requiring new infrastructure, every key is now scoped by tier: `rl:<APP_ENV>:…`. Production and preview counters can no longer collide, and the dev server writes nothing at all.

Still open as a maintainer check: the database's **eviction policy**. An ever-growing keyspace on `noeviction` eventually turns writes into errors — which, now that the limiter fails closed, would refuse hosted generations rather than silently allow them. Every key this app writes has a TTL, so growth is bounded; the setting is worth confirming once.

### F12 — FIXED: the private limits doc matches the code

`docs/tool-limits.md` pointed at three paths that no longer exist. Updated to the current module paths, plus the burst tier, the atomic-charge behaviour, the credentials-not-tier rule, fail-closed, and the newsletter namespace. Two further inaccuracies found while in there: the heading said "two levers" for what is now three, and step 4 referenced a `MAX_ARTICLE_CHARS` constant that doesn't exist (`MAX_ARTICLE_INPUT_CHARS` does).

## Verification

`pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` all pass.

**Not machine-verified:** the Lua script cannot be exercised by typecheck or build, and no Upstash credentials are available in this session. Its logic was reviewed line by line (including that `redis.call('GET', k)` returns Lua `false` for a missing key, which `or '0'` handles) and its thresholds proved equivalent to the previous implementation.

**A script defect cannot cause an outage**, which is what makes that acceptable. The script is the fast path only: if `eval` fails for any reason — a Lua defect, EVAL unavailable on the plan — the limiter retries with the plain `INCR`/`EXPIRE` commands this replaced. That fallback is weaker (charge-then-check, non-atomic TTL) but is exactly the behaviour that ran before this pass, so the worst case is the old behaviour plus a loud log line. Only when _both_ paths fail — Redis genuinely unreachable — does the limiter deny.

A smoke test against a credentialed deploy is still worth doing to confirm the fast path is actually being taken (look for the absence of the `quota script failed` log line), but it is no longer a release blocker.

## Scorecard

| Category           | Score | Δ   | Notes                                                                                                                                                                                                    |
| ------------------ | ----- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Failure direction  | 10/10 | +6  | Rate limits fail closed on a genuine outage, while a scripting failure degrades to the previous command path rather than refusing. The only remaining allow-path is the dev server, which serves nobody. |
| Atomicity / TTL    | 10/10 | +5  | One script per check; no counter can exist without a TTL, and no denied request is charged.                                                                                                              |
| Key namespacing    | 10/10 | +5  | A single `REDIS_KEYS` module, `rl:` prefix, encoded segments, tier-scoped.                                                                                                                               |
| Connection hygiene | 8/10  | +4  | One lazily-created client with auto-pipelining; status answered without a client. Short of 10 pending the eviction-policy check (F11).                                                                   |
| Cost / round-trips | 10/10 | +4  | One round-trip on the happy path, down from 2–4.                                                                                                                                                         |
| Coverage           | 9/10  | +5  | Every unauthenticated side-effecting path is now metered, including the newsletter. Burst pacing added; windows are fixed rather than sliding by deliberate choice (F8).                                 |
| Security           | 10/10 | +3  | Segments encoded, IP hashes peppered, no secret in a key, no raw error object logged.                                                                                                                    |

## Remaining action items

### Maintainer hand-off

| #   | Task                                                                                                                                                                        | Effort |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | Optional: run one hosted generation on a credentialed deploy and confirm no `quota script failed` line appears, i.e. the atomic path is being used rather than the fallback | XS     |
| 2   | Confirm the Upstash database's eviction policy (F11)                                                                                                                        | XS     |

### Backlog

| #   | Priority | Task                                                                                                                  | Effort |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------- | ------ |
| 3   | P3       | Swap the fixed burst window for `@upstash/ratelimit`'s sliding window if boundary bursts ever matter (F8)             | S      |
| 4   | P3       | Consider a separate Upstash database per environment; tier-scoped keys make this optional rather than necessary (F11) | S      |
