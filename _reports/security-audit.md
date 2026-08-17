# Security audit — The Productivity Bug (tools.timonwa.com)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `feat/the-productivity-bug` · **Scope:** whole repo — client (`src/app`, `src/components`, `src/lib/utils`) and server (`src/lib/server`: 3 Server Actions, Gemini/AI SDK path, Upstash rate limiting, MDX content loaders), plus dependency surface · **Overall:** 7/10

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | N/A      | 7/10    | N/A | N/A   |

First run — no previous report in `_reports/`, so every finding is `NEW` and there is no "Resolved since last audit" section.

## Findings

| ID  | Severity | Category           | Status | Issue                                                                                                                                                        | Location                                                       |
| --- | -------- | ------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 1   | HIGH     | Supply chain       | NEW    | Next.js 16.2.10 carries 4 HIGH + 6 MODERATE advisories fixed in 16.2.11, incl. a Server Action DoS                                                           | `package.json:34`                                              |
| 2   | HIGH     | Resource limits    | NEW    | Server Action params are never validated — `existing`, `primaryKeyword`, `style` bypass the 15 000-char input cap and go straight into the prompt            | `src/lib/server/actions/seo-meta.action.ts:134`                |
| 3   | HIGH     | Resource limits    | NEW    | Newsletter signup action has no rate limit or bot check — unlimited writes to Sender.net                                                                     | `src/lib/server/actions/newsletter.action.ts:23`               |
| 4   | MEDIUM   | Misconfiguration   | NEW    | No CSP and no security headers at all (no `middleware.ts`, no `headers()` in next config)                                                                    | `next.config.ts:4`                                             |
| 5   | MEDIUM   | Resource limits    | NEW    | Rate limiting fails open on Redis error and is absent whenever Upstash env vars are unset                                                                    | `src/lib/server/utils/rate-limit.utils.ts:85,104`              |
| 6   | MEDIUM   | Supply chain / XSS | NEW    | `dompurify@3.4.12` is vulnerable (patched 3.4.13) and is the only guard on the app's one user-content HTML sink                                              | `package.json:24`                                              |
| 7   | MEDIUM   | Supply chain       | NEW    | Other production advisories: `sharp` (HIGH), `js-yaml` via `gray-matter` (HIGH), `postcss`/`nanoid`; the workspace pin no longer covers the postcss advisory | `pnpm-workspace.yaml`                                          |
| 8   | LOW      | SSRF               | NEW    | SSRF host denylist misses the normalized IPv4-mapped IPv6 loopback form and does no DNS resolution                                                           | `src/lib/server/utils/ai/article-source-validation.utils.ts:8` |
| 9   | LOW      | Supply chain       | NEW    | Third-party analytics script loaded with no SRI and no CSP to constrain it                                                                                   | `src/app/layout.tsx:77`                                        |
| 10  | LOW      | Secrets & config   | NEW    | `IP_HASH_SECRET` is optional in production — a missing value only logs a warning                                                                             | `src/lib/config/env.ts:21`                                     |
| 11  | LOW      | Logging            | NEW    | Whole AI SDK error objects are logged, including `requestBodyValues` (the user's article) — needs confirmation                                               | `src/lib/server/utils/ai/errors.utils.ts:16`                   |

### F1 — Next.js 16.2.10 has four HIGH advisories fixed in 16.2.11

- **What:** `package.json` pins `"next": "16.2.10"`; `pnpm audit` reports 10 advisories against it, all patched in `>=16.2.11`. The HIGHs are: **Denial of Service in App Router using Server Actions**, SSRF in Server Actions on custom servers, SSRF in rewrites via attacker-controlled destination hostname, and Middleware/Proxy bypass with Turbopack + single locale. MODERATEs include **Unauthenticated disclosure of internal Server Function endpoints** and two response-body cache-confusion issues. The app's entire dynamic surface is Server Actions (`src/lib/server/actions/`), so the Server Action DoS and the Server Function endpoint disclosure both land squarely on code paths this app actually uses.
- **Why it matters:** A live site can be taken down (or have its cache poisoned) via a framework bug with no application-side mitigation. OWASP A06 / A05.
- **Fix:** Bump to `next@>=16.2.11` (`eslint-config-next` alongside it) and re-run `pnpm audit`. This is the single highest-value change in this report.

### F2 — Server Action parameters are never validated; several bypass the input-size cap

- **What:** None of the three actions validate their arguments — there is no Zod parse at the action boundary, only ad-hoc clamping of `variationCount` (`seo-meta.action.ts:110`). `resolveArticleSource` caps `source.text` at `MAX_ARTICLE_INPUT_CHARS` (15 000, `article.constant.ts:4`), but three other client-supplied values reach the prompt with no length or shape check at all:
  - `params.existing` in `regenerateSeoMetaVariation` — an unbounded array whose `title`/`description` strings are interpolated verbatim into the prompt (`seo-meta.action.ts:50-57`, called at `:151`).
  - `params.primaryKeyword` — only `.trim()`ed, then interpolated (`seo-meta.action.ts:38`).
  - `params.style` in the social-posts actions — `JSON.stringify(style)` is appended to the prompt wholesale (`social-posts.action.ts:141`), and `platforms` / `xThreadLength` are likewise interpolated unchecked (`:113-140`).
    Server Actions are ordinary POST endpoints: an attacker calls `regenerateSeoMetaVariation` directly with `source: { kind: "text", text: "hi" }` and a multi-megabyte `existing` array, and the server forwards all of it to Gemini on the platform key (`PLATFORM_GEMINI_KEY`, `seo-meta.service.ts:19`). The daily quota counts _requests_, not tokens, so the per-request cost is unbounded — and each of the allowed daily requests can be maximally expensive. The same channel is an unfiltered prompt-injection surface: attacker-controlled text lands in the instruction block above the system prompt's task, letting the hosted key be steered as a general-purpose LLM.
- **Why it matters:** Direct, uncapped spend on the owner's Gemini key plus a prompt-injection path into the hosted model. OWASP API4 (Unrestricted Resource Consumption) / API3 / A03.
- **Fix:** Add a Zod schema per action and `parse` before any other work — `source` as a discriminated union with `text.max(MAX_ARTICLE_INPUT_CHARS)` and `url.url()`, `primaryKeyword.max(120)`, `existing` as `.array(...).max(3)` with per-string `.max(300)`, `platforms` as `z.enum(SOCIAL_POST_PLATFORMS).array().max(6)`, `xThreadLength` as `z.number().int().min(1).max(N)`, and `style` as a closed object schema (not a stringified passthrough). `byokApiKey` should also get a length/charset bound. The model allowlist in `gemini.client.ts:26` is exactly the right instinct — it just needs to cover every other client-supplied field.

### F3 — Newsletter signup action has no rate limit or bot protection

- **What:** `subscribeNewsletter` validates the email shape and then POSTs to `https://api.sender.net/v2/subscribers` with the server's `SENDER_API_TOKEN` (`newsletter.action.ts:47-60`). There is no quota check (`enforceDailyQuota` is never called here), no captcha, no honeypot, and no per-IP throttle — the only rate limiting in the codebase is wired into the two AI tools. The action is reachable as a plain POST, so a script can submit thousands of addresses per minute.
- **Why it matters:** Subscription bombing (adding third-party addresses to the list without consent), pollution of the subscriber list, burning the Sender.net plan quota, and — because the response distinguishes "already subscribed" from a fresh signup (`:73-78`) — a subscriber-enumeration oracle for any guessed address. OWASP API4 / A04.
- **Fix:** Reuse the existing `checkAndIncrementQuota` primitive with a `newsletter` slug and a tight per-IP daily cap, and return the same neutral message for both the fresh-signup and already-subscribed branches so membership can't be probed. Sender's own double opt-in (`trigger_automation: false` currently skips automation) should be relied on for consent.

### F4 — No Content Security Policy and no security headers

- **What:** `next.config.ts` defines only `redirects()` — no `headers()`. There is no `middleware.ts` anywhere in `src/`. Grep for `Content-Security`, `frame-ancestors`, `X-Frame`, and `nonce` across `src/` and the config returns nothing but a prose mention inside a content MDX file. So the site ships with no CSP, no `frame-ancestors`/`X-Frame-Options`, no `Referrer-Policy`, and no `Permissions-Policy`.
- **Why it matters:** The app has an inline `<script>` (`layout.tsx:70`), three `dangerouslySetInnerHTML` JSON-LD patterns, a sink that injects **user-supplied markup** into the DOM (`SvgToJsxTool.tsx:310`), and a user secret in `sessionStorage` (the BYOK Gemini key, `byok.utils.ts:42`). No XSS is currently reachable — the JSON-LD escapes `<` (`JsonLdScript.tsx:7`) and the SVG sink is DOMPurified — but a CSP is the layer that keeps a future regression, or a compromise of the third-party analytics host (F9), from turning into key theft. OWASP A02/A05.
- **Fix:** Add a `headers()` block (or middleware) with a nonce-based `script-src` — no `unsafe-inline` — covering `cloud.umami.is`, plus `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`, and an explicit HSTS header. The theme snippet at `layout.tsx:59-70` needs the nonce threaded through it.

### F5 — Rate limiting fails open, and is silently absent without Upstash

- **What:** `checkAndIncrementQuota` returns `{ allowed: true }` when `getRedis()` is `null` (`rate-limit.utils.ts:85`) and again inside the `catch` on any Redis error (`:104-107`). `getRedis()` returns `null` whenever `APP_ENV !== "production"` or either Upstash variable is unset (`:25-30`). Both branches are deliberate and commented — but the consequence in production is that an Upstash outage, a revoked token, or a forgotten `APP_ENV=production` on deploy removes _all_ limits from both AI tools while they keep spending the owner's Gemini key.
- **Why it matters:** A single availability blip on a third-party dependency converts into unbounded LLM cost. Combined with F2 (unbounded per-request size) the blast radius is a bill, not a nuisance. OWASP API4.
- **Fix:** Keep fail-open if that's the product decision, but bound it: an in-process token-bucket fallback (per instance) when Redis is unreachable, and a startup hard-fail (or loud alert) when `isProduction` is true and the Upstash vars are missing — the same treatment `IP_HASH_SECRET` gets at `:53`, but escalated beyond a warning.

### F6 — `dompurify@3.4.12` is the vulnerable version, and it guards the app's only user-HTML sink

- **What:** `package.json:24` declares `"dompurify": "^3.4.12"` and the installed tree resolves to exactly 3.4.12, which `pnpm audit` flags (GHSA / "IN_PLACE hook removal leaves a detached subtree executable, causing XSS", patched `>=3.4.13`). This is the library sanitizing pasted SVG before it is injected at `SvgToJsxTool.tsx:145` → `:310`.
- **Why it matters:** The advisory's specific trigger is an `IN_PLACE` hook, which this call site does not use (it passes only `USE_PROFILES`), so it is not exploitable as written — but a known-vulnerable sanitizer sitting in front of the one place attacker-influenced HTML enters the DOM is exactly the dependency you keep current. OWASP A06.
- **Fix:** `pnpm up dompurify@^3.4.13`.

### F7 — Remaining production dependency advisories, and a stale postcss pin

- **What:** `pnpm audit` reports, on non-dev paths: `sharp@0.34.5` HIGH (inherited libvips CVEs, patched `>=0.35.0`, pulled in by `next`), `js-yaml@3.15.0` HIGH via `gray-matter` (quadratic CPU on `!!omap`, patched `>=3.15.1`), and `postcss@8.5.17` + `nanoid@3.3.15` HIGH via `next`. `pnpm-workspace.yaml` pins `postcss >=8.5.10` specifically to patch a transitive vulnerability, but the current advisory (`GHSA-r28c-9q8g-f849`, path traversal via `sourceMappingURL`) covers `<=8.5.17` — the pin no longer achieves its stated purpose.
- **Why it matters:** `sharp` and `postcss` are build/image-pipeline only and process repo-owned inputs here, so real exploitability is low; `js-yaml` parses only first-party MDX frontmatter (`create-mdx-loader.utils.ts:47`). This is hygiene and audit-noise reduction rather than an open door — but the postcss pin is actively misleading as documented in `AGENTS.md`.
- **Fix:** Raise the `pnpm-workspace.yaml` postcss pin to `>=8.5.18` (and add `nanoid >=3.3.18`), bump `gray-matter`'s `js-yaml` via an override, and let the Next bump in F1 carry `sharp`.

### F8 — SSRF denylist misses the normalized IPv4-mapped IPv6 loopback

- **What:** `isBlockedHost` claims to handle the `::ffff:` mapped form via its dotted-quad regex (`article-source-validation.utils.ts:19-20`), but Node's `URL` normalizes that form before the check ever sees a dot. Verified: `new URL("http://[::ffff:127.0.0.1]/").hostname === "[::ffff:7f00:1]"`. After the bracket strip the host is `::ffff:7f00:1` — it isn't `::1`, doesn't start with `fe80:`/`fc`/`fd`, and the `(\d{1,3})\.` regex finds no match, so `isBlockedHost` returns `false` and the URL is accepted as a public target. Decimal and octal encodings _are_ caught (Node normalizes `http://2130706433/` and `http://0177.0.0.1/` to `127.0.0.1`, which the regex matches). Separately, the check is purely lexical: a public hostname whose DNS record points at a private address passes, and redirects are not re-checked. The CGNAT range `100.64.0.0/10` is also absent.
- **Why it matters:** Impact today is nil, and that is worth stating plainly: nothing in this codebase fetches the user's URL. The only outbound `fetch()` in `src/` is the Sender.net call; the article URL is handed to Gemini's provider-executed `url_context` tool (`generate-from-article.utils.ts:27`), so retrieval happens inside Google's network, not ours. The finding is that a security control with a comment asserting coverage does not have it — and it is the control that would matter the day a server-side fetch, screenshot, or metadata-preview feature is added.
- **Fix:** Normalize and parse the host as an IP (or use `node:net`'s `isIP`) instead of regex-matching text, expand the ranges (`100.64/10`, `192.0.0.0/24`, `198.18/15`), and if server-side fetching is ever introduced, resolve DNS and re-validate on every redirect hop.

### F9 — Third-party analytics script with no SRI and no CSP behind it

- **What:** `layout.tsx:77-83` loads `https://cloud.umami.is/script.js` in production with no `integrity` attribute, and F4 establishes there is no CSP to constrain what that origin may do once loaded.
- **Why it matters:** A compromise of the umami CDN yields arbitrary script execution on every page, which includes read access to the BYOK Gemini key in `sessionStorage`. OWASP A08.
- **Fix:** SRI is impractical on a rolling third-party bundle, so the mitigation is the CSP in F4 (pin the exact host, no `unsafe-inline`) — and consider self-hosting the script so `integrity` becomes possible.

### F10 — `IP_HASH_SECRET` is optional in production

- **What:** `env.ts:21` declares `IP_HASH_SECRET` as `z.string().optional()`; when it's unset in production, `getClientIpHash` falls back to unkeyed `sha256(ip)` truncated to 16 hex chars (`rate-limit.utils.ts:70-74`) and the only consequence is a `console.warn` (`:53-57`).
- **Why it matters:** An unkeyed hash of an IPv4 address is exhaustively reversible, so a leaked Redis dump (or Upstash console access) de-anonymizes every visitor who used an AI tool. The code documents this precisely — the gap is that nothing enforces it. OWASP A02/A05.
- **Fix:** Make the field required when `APP_ENV === "production"` via a Zod `superRefine`, so a misconfigured deploy fails at boot rather than degrading quietly.

### F11 — Full AI SDK error objects are logged (needs confirmation)

- **What:** `toUserMessage` opens with `console.error(\`[${opts.logTag}]\`, error)` (`errors.utils.ts:16`), passing the raw error. The AI SDK's `APICallError`carries`requestBodyValues`— the request payload, which for these tools contains the user's pasted article.`AGENTS.md` states tool input is "not logged or cached".
- **Why it matters:** Any Gemini 4xx/5xx would put user content into the platform logs, contradicting the stated privacy posture. **Needs confirmation:** Node's `console.error` inspects to depth 2, and the article text sits at roughly depth 4 (`requestBodyValues.contents[].parts[].text`), so it is most likely rendered as `[Object]` rather than printed. The exposure is latent — it materializes if anything ever `JSON.stringify`s the error or raises the inspect depth.
- **Fix:** Log a curated shape instead of the error object — `logTag`, `error.name`, `error.message`, `statusCode`, and nothing else.

## Scorecard

| Category                    | Score | Notes                                                                                                                                                                |
| --------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization (authz)       | 9/10  | No accounts, no per-user data, no object ids in any action — nothing to get wrong; BYOK keys never touch the server beyond one request.                              |
| Auth & sessions             | 9/10  | No auth surface, no cookies, no tokens; the BYOK key correctly uses `sessionStorage` (tab-scoped) rather than `localStorage`.                                        |
| Injection                   | 8/10  | No SQL, no `eval`; JSON-LD escapes `<`; MDX slugs are allowlisted against traversal; the SVG sink is DOMPurified — but the sanitizer is stale (F6).                  |
| Server-Side Request Forgery | 7/10  | No server-side fetch of user URLs exists, so the surface is closed today; the denylist itself has a verified gap and no DNS check (F8).                              |
| Resource limits             | 4/10  | Two-tier quotas on the AI tools are thoughtful, but per-request size is unbounded (F2), the newsletter action is unlimited (F3), and limits fail open (F5).          |
| Secrets & config            | 7/10  | No secrets committed, `.env*` gitignored, no `NEXT_PUBLIC_*` at all, `server-only` on the env module; production-critical vars stay optional (F10).                  |
| Frontend                    | 6/10  | Every `target="_blank"` has `rel="noopener noreferrer"`, error pages leak nothing, no dangerous DOM sinks beyond the sanitized one — but zero security headers (F4). |

## Action items

### Fix Now

| #   | Priority | Task (finding ID)                                                                                                                        | Effort |
| --- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Bump `next` to `>=16.2.11` (+ `eslint-config-next`) and re-run `pnpm audit` (F1)                                                         | S      |
| 2   | P0       | Add Zod validation at all three Server Action boundaries; bound `existing`, `primaryKeyword`, `style`, `platforms`, `xThreadLength` (F2) | M      |
| 3   | P0       | Rate-limit `subscribeNewsletter` via `checkAndIncrementQuota` and neutralize the already-subscribed response (F3)                        | S      |

### Next Release

| #   | Priority | Task (finding ID)                                                                                                     | Effort |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------- | ------ |
| 4   | P1       | Add nonce-based CSP + `frame-ancestors`/`base-uri`/`object-src`/`Referrer-Policy`/HSTS headers (F4, F9)               | M      |
| 5   | P1       | Bound the fail-open path: in-process fallback limiter + boot-time check that Upstash is configured in production (F5) | M      |
| 6   | P1       | `pnpm up dompurify@^3.4.13` (F6)                                                                                      | S      |
| 7   | P2       | Raise the `postcss` pin to `>=8.5.18`, add `nanoid`/`js-yaml` overrides (F7)                                          | S      |
| 8   | P2       | Require `IP_HASH_SECRET` when `APP_ENV=production` via `superRefine` (F10)                                            | S      |

### Backlog

| #   | Priority | Task (finding ID)                                                                                   | Effort |
| --- | -------- | --------------------------------------------------------------------------------------------------- | ------ |
| 9   | P3       | Rewrite `isBlockedHost` to parse IPs properly, add the missing ranges, fix the `::ffff:` claim (F8) | S      |
| 10  | P3       | Log a curated error shape instead of the raw AI SDK error object (F11)                              | S      |

## Verified as safe (no finding)

Checked and demonstrably guarded — recorded so future runs don't re-litigate them:

- **Path traversal in MDX loading** — `SLUG_PATTERN` (`create-mdx-loader.utils.ts:22`) allowlists `[a-z0-9-]+` before any `path.join`, and every `[slug]` route resolves through `getOne`.
- **BYOK quota bypass** — sending a junk `byokApiKey` skips `enforceDailyQuota` (`quota.utils.ts:26`) but is then used as the Gemini key (`gemini.client.ts:17`), so the request fails without spending the platform key.
- **Model-string injection** — client-supplied `byokModel` is checked against `ALLOWED_BYOK_MODELS` and only honored on the BYOK path (`gemini.client.ts:26-29`).
- **`x-forwarded-for` spoofing** — the limiter prefers `x-real-ip` and falls back to the _right-most_ XFF entry, not the attacker-controlled left-most (`rate-limit.utils.ts:66`).
- **JSON-LD script breakout** — `<` is escaped to the `<` unicode form in all three renderers (`JsonLdScript.tsx:7`, `ToolContent.tsx:65`, `Breadcrumbs/index.tsx:96`).
- **`javascript:` hrefs from model output** — `article.url` is always the server-stamped, `http(s)`-validated source URL or `""` (`generate-from-article.utils.ts:120`, `assertSafeArticleUrl`).
- **Secrets in the bundle / git history** — no `NEXT_PUBLIC_*` variables exist, `env.ts` is `server-only`, only `.env.example` (all-empty values) is tracked, and no `.env` with values appears in 210 commits.
- **Error-page information disclosure** — `error.tsx` / `global-error.tsx` render fixed copy and never surface `error.message` or `digest`.
- **Dynamic-import injection in `ToolContent`** — `currentSlug` is a literal passed from static tool pages, and the webpack context is limited to `src/content/tools/*.mdx`.
