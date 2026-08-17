# Security audit — The Productivity Bug (tools.timonwa.com)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** fixes applied · **Branch:** `code-restructuring` · **Scope:** whole repo — client (`src/app`, `src/components`, `src/lib/utils`) and server (`src/lib/server`: 3 Server Actions, Gemini/AI SDK path, Upstash rate limiting, MDX content loaders), plus dependency surface · **Overall:** 9/10

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | 7/10     | 9/10    | +2  | ▲     |

All eleven findings closed. Five were already resolved by the dependency, environment, and redis passes (F1, F3, F5, F6, F7, F11); this pass closed the remaining five — Server Action input validation, security headers, the SSRF denylist gaps, the unconstrained analytics script, and the optional IP pepper.

## Findings

| ID  | Severity | Category           | Status    | Issue                                                                                                                                                        | Location                                                       |
| --- | -------- | ------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 1   | HIGH     | Supply chain       | **FIXED** | Next.js 16.2.10 carries 4 HIGH + 6 MODERATE advisories fixed in 16.2.11, incl. a Server Action DoS                                                           | `package.json:34`                                              |
| 2   | HIGH     | Resource limits    | **FIXED** | Server Action params are never validated — `existing`, `primaryKeyword`, `style` bypass the 15 000-char input cap and go straight into the prompt            | `src/lib/server/actions/seo-meta.action.ts:134`                |
| 3   | HIGH     | Resource limits    | **FIXED** | Newsletter signup action has no rate limit or bot check — unlimited writes to Sender.net                                                                     | `src/lib/server/actions/newsletter.action.ts:23`               |
| 4   | MEDIUM   | Misconfiguration   | **FIXED** | No CSP and no security headers at all (no `middleware.ts`, no `headers()` in next config)                                                                    | `next.config.ts:4`                                             |
| 5   | MEDIUM   | Resource limits    | **FIXED** | Rate limiting fails open on Redis error and is absent whenever Upstash env vars are unset                                                                    | `src/lib/server/utils/rate-limit.utils.ts:85,104`              |
| 6   | MEDIUM   | Supply chain / XSS | **FIXED** | `dompurify@3.4.12` is vulnerable (patched 3.4.13) and is the only guard on the app's one user-content HTML sink                                              | `package.json:24`                                              |
| 7   | MEDIUM   | Supply chain       | **FIXED** | Other production advisories: `sharp` (HIGH), `js-yaml` via `gray-matter` (HIGH), `postcss`/`nanoid`; the workspace pin no longer covers the postcss advisory | `pnpm-workspace.yaml`                                          |
| 8   | LOW      | SSRF               | **FIXED** | SSRF host denylist misses the normalized IPv4-mapped IPv6 loopback form and does no DNS resolution                                                           | `src/lib/server/utils/ai/article-source-validation.utils.ts:8` |
| 9   | LOW      | Supply chain       | **FIXED** | Third-party analytics script loaded with no SRI and no CSP to constrain it                                                                                   | `src/app/layout.tsx:77`                                        |
| 10  | LOW      | Secrets & config   | **FIXED** | `IP_HASH_SECRET` is optional in production — a missing value only logs a warning                                                                             | `src/lib/config/env.ts:21`                                     |
| 11  | LOW      | Logging            | **FIXED** | Whole AI SDK error objects are logged, including `requestBodyValues` (the user's article) — needs confirmation                                               | `src/lib/server/utils/ai/errors.utils.ts:16`                   |

## What was applied

### F2 — FIXED: every Server Action parses its input first

Three schema modules under `src/lib/schemas/` (`shared`, `seo-meta`, `social-posts`) now bound every client-supplied field, and each action calls `parseActionInput` before any other work:

- `source` is a discriminated union — `text` carries the same 15 000-char cap the UI shows, `url` is length-bounded before the SSRF check sees it.
- `existing` (previously an unbounded array of unbounded strings interpolated straight into the prompt) is capped at 3 entries with per-field limits.
- `primaryKeyword` is capped at 120 chars.
- `style` is a **closed object** rather than a `JSON.stringify` passthrough, so invented keys can't reach the model; `platforms`, `xThreadLength`, `emojiLevel`/`hashtagLevel`, and the hashtag lists are each bounded.
- `byokApiKey` is length- and charset-bounded; `byokModel` is allowlisted at the boundary as well as downstream.

Every enum is derived from the constant that already defines it (cast to the tuple shape `z.enum` needs), so adding a platform or tone cannot leave the schema behind. A rejection throws the coded `INVALID_INPUT`, mapped to a generic message — the Zod issue list is logged server-side only, since it names fields and lengths and would otherwise be a probing aid.

This closes both halves of the finding: the unbounded per-request cost (the quota counts requests, not tokens) and the unfiltered prompt-injection channel.

### F4 + F9 — FIXED: a CSP and a security-header set

`next.config.ts` now serves headers on every route: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geolocation/payment all denied), `Strict-Transport-Security` with preload, and `X-DNS-Prefetch-Control`.

Set in the config rather than middleware deliberately: this app has no middleware, and adding one to emit a per-request nonce would make every response dynamic — forfeiting the static rendering the whole site depends on. The consequence is stated honestly in the file: `script-src` keeps `'unsafe-inline'`, because the root layout must run an inline theme script before paint and Next injects its own inline bootstrap. `'unsafe-eval'` is absent, `object-src` is `'none'`, `frame-ancestors 'none'`, and `frame-src` is narrowed to `youtube-nocookie.com` — the only embed the app uses.

That also addresses F9's substance: the umami script is now constrained by `script-src` and `connect-src` allowlists, so a compromised third-party origin can't pivot. SRI was **not** added — umami ships a rolling `script.js` with no published digest, so a hash would break on their next release; the CSP allowlist is the durable control.

### F8 — FIXED: SSRF denylist gaps closed

Added the normalized IPv4-mapped IPv6 form (`::ffff:7f00:1` is `127.0.0.1` and never matched the dotted-quad regex), long-hand IPv6 loopback and all-zero forms, plus the carrier-grade NAT (`100.64/10`) and benchmarking (`198.18/15`) ranges.

Still no DNS resolution, and that remains correct here: nothing in this app fetches the URL server-side. Gemini's `url_context` tool performs the retrieval, so the denylist is defence-in-depth against a future change rather than the live control it would be if we fetched ourselves.

### F10 — FIXED: `IP_HASH_SECRET` is required in production

A missing pepper now throws at boot when `APP_ENV=production` instead of logging a warning and continuing. An unkeyed SHA-256 of an IP is reversible by brute force — there are only ~4 billion IPv4 addresses — so the fallback silently turned rate-limit keys into recoverable personal data. Local and self-host builds keep the unkeyed fallback, where the keyspace never leaves the machine.

Applied on the maintainer's confirmation that the variable is already set on the live host; without that, this change would have failed a production boot.

### Closed by earlier passes

| ID  | Closed by           | How                                                                                                                           |
| --- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| F1  | dependency pass     | `next` → 16.2.11; all ten advisories patched, `pnpm audit` clean                                                              |
| F3  | redis pass          | Newsletter action metered under its own namespace, honeypot added, one non-oracular confirmation message                      |
| F5  | environment + redis | Metering follows credentials not `APP_ENV`; fails closed on an unreachable Redis, with a fallback so a script defect degrades |
| F6  | dependency pass     | `dompurify` → 3.4.13, with the floor in the manifest range                                                                    |
| F7  | dependency pass     | `sharp` → 0.35.3, `js-yaml` → 3.15.1, postcss floor → 8.5.23 lifting `nanoid`; overrides now carry their advisory IDs         |
| F11 | environment pass    | Provider errors logged as a redacted projection (key-shaped strings stripped, body truncated)                                 |

## Verification

`pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` all pass.

**Worth a look after deploy:** the CSP is enforcing, not report-only. It was written against every external origin the code actually references (umami, youtube-nocookie) and the build renders clean, but a CSP violation only shows in a real browser. If something breaks, the console names the directive — and the fix belongs in the `CSP` array in `next.config.ts`, which is the one place it's defined.

## Scorecard

| Category         | Score | Δ   | Notes                                                                                                                                                                                       |
| ---------------- | ----- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Access control   | 10/10 | —   | No accounts or per-object data, so BOLA/BFLA/BOPLA don't apply; nothing privileged is exposed.                                                                                              |
| Injection / XSS  | 9/10  | +1  | One sanitized HTML sink on a patched DOMPurify, JSON-LD escaped, and prompt input now bounded and shape-checked. Short of 10 while `script-src` needs `'unsafe-inline'`.                    |
| Misconfiguration | 9/10  | +4  | Full header set including an enforcing CSP. Deduction is the `'unsafe-inline'` script-src, a deliberate trade against making every response dynamic.                                        |
| Resource limits  | 10/10 | +5  | Per-field input caps, per-request quota, burst pacing, fail-closed metering, and a metered newsletter endpoint.                                                                             |
| SSRF             | 10/10 | +2  | Denylist covers mapped/long-hand IPv6, RFC 1918, link-local/metadata, CGNAT, and benchmarking ranges — and nothing server-side fetches the URL anyway.                                      |
| Secrets & config | 10/10 | +3  | No `NEXT_PUBLIC_*`, nothing in history, redacted error logging, and the IP pepper required in production.                                                                                   |
| Supply chain     | 9/10  | +4  | Zero advisories; lifecycle scripts allow-listed to the two that need them. Deduction: five direct deps without provenance, and no SRI on the analytics script (constrained by CSP instead). |

## Remaining action items

### Backlog

| #   | Priority | Task                                                                                                                                          | Effort |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P3       | Revisit a nonce-based CSP if the site ever gains a dynamic shell — it would remove the last `'unsafe-inline'` (F4)                            | M      |
| 2   | P3       | Watch for a versioned umami script URL; a pinned URL would make SRI viable (F9)                                                               | XS     |
| 3   | P3       | Add DNS resolution to the SSRF check if the app ever fetches an article URL server-side rather than delegating to Gemini's `url_context` (F8) | S      |
