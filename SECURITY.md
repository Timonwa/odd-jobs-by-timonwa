# Security Policy

Thanks for helping keep The Productivity Bug and its users safe.

## Supported versions

The Productivity Bug is a single-version, actively-developed web app. Security fixes are applied to the **latest commit on `main`** and rolled out to the hosted instance shortly after.

| Version         | Supported |
| --------------- | --------- |
| Latest (`main`) | ✅        |
| Older commits   | ❌        |

There are no tagged releases yet; the hosted instance always runs the latest `main`.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

### Preferred: GitHub Security Advisories

[Open a private advisory →](https://github.com/Timonwa/tools-by-timonwa/security/advisories/new)

This is a private channel between you and the maintainer — nothing you submit is publicly visible until we publish the advisory together after a fix ships.

### Fallback: email

[me[@]timonwa[dot]com](mailto:me@timonwa.com?subject=Security%20vulnerability%20in%20tools-by-timonwa)

Please include:

- A clear description of the issue and its impact
- Steps to reproduce (including the commit / deployed URL you tested against)
- Any proof-of-concept code or logs, if relevant
- Whether you'd like to be credited in the fix announcement

## What to expect

- **Acknowledgment within 72 hours** of your report reaching me.
- **Initial triage within 7 days** — I'll let you know whether the report is accepted, declined, or needs more detail.
- **Fix timeline depends on severity.** Critical issues (data leakage, auth bypass, RCE) are prioritized immediately. Lower-severity issues may take longer, especially around releases.
- **Credit.** Reporters of accepted vulnerabilities get credit in the release notes and advisory, unless you prefer to remain anonymous.
- **Coordinated disclosure.** Please give me a reasonable window to ship a fix before publishing details. 90 days is a common baseline; I'll aim faster for anything serious.

## In scope

- Unintended data exposure — BYOK keys, your tool input, or hashed IPs leaked beyond documented behavior
- Authentication, authorization, or rate-limit bypass on the hosted instance
- XSS, CSRF, SSRF, injection, or other OWASP-category vulnerabilities
- Supply-chain issues with direct dependencies that affect production

## Out of scope

- Prompt injection of the LLM — agent prompts are public by design (they live in `src/lib/server/services/` and PRs to improve them are welcome), and every agent's output is validated against a Zod schema before it reaches the page
- Rate-limit evasion — a known limitation of the hosted daily quota
- Vulnerabilities in third-party services (Google AI Studio, Upstash, Vercel) — please report those directly to the respective vendors
- Missing best-practice HTTP headers that have no concrete impact
- Findings from automated scanners without a reproducible exploit

## What is stored where

Before reporting, skim the **Privacy** section of [README.md](./README.md) for the full data-flow picture. TL;DR:

- **Your BYOK key** → browser `sessionStorage` only, cleared on tab close; sent with a request to the server only to make the Gemini call, never stored or logged
- **Your tool input** (pasted text / URLs) → request-scoped on the server, not cached, not logged; lives in your browser's React state otherwise
- **Fetched article content** (for URL-based tools) → 1-hour in-memory cache, keyed by URL
- **Rate-limit counters** → keyed (HMAC-SHA256) hash of IP + daily counter in Upstash Redis, resets at UTC midnight

Thanks again. ❤️
