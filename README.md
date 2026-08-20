<div align="center">
  <h1>Odd Jobs</h1>
  <b>The odd jobs in writing and code — free tools that each do one of them, plus guides and templates to help you work better.</b>
  <br/><br/>

<a href="https://odd-jobs.timonwa.com"><img alt="Live site" src="https://img.shields.io/website?url=https%3A%2F%2Fodd-jobs.timonwa.com&style=flat-square&label=odd-jobs.timonwa.com&up_message=online&down_message=offline" /></a>
<a href="./LICENSE"><img alt="License: AGPL v3.0" src="https://img.shields.io/badge/License-AGPL%20v3.0-blue?style=flat-square" /></a>
<a href="./CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" /></a>
<a href="https://www.timonwa.com/support"><img alt="Support" src="https://img.shields.io/badge/Support-%E2%9D%A4-ea4aaa?style=flat-square&logo=githubsponsors&logoColor=white" /></a>
</div>

---

Every project has odd jobs — the small, repetitive tasks between the real work. Counting characters for a title. Turning a headline into a slug. Writing the meta description. Odd Jobs is where those get done, for writers, developers, and creators.

Three things live here:

- **Tools** — one page, one job. Most run entirely in your browser; the AI ones use Gemini.
- **Guides** — a [blog](https://odd-jobs.timonwa.com/blog) and a monthly [newsletter](https://odd-jobs.timonwa.com/newsletter) on the tools, shortcuts, and workflows worth stealing.
- **Templates** — a [shop](https://odd-jobs.timonwa.com/shop) of generators, templates, custom GPTs, starters, and guides. Most of them free.

No account, no sign-up, no paywall. Open source.

**[odd-jobs.timonwa.com →](https://odd-jobs.timonwa.com)**

## Tools

**AI tools** — powered by Gemini; use the daily free quota or bring your own key.

| Tool                                                                                | What it does                                                                                                                                                           |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Article to SEO Meta](https://odd-jobs.timonwa.com/article-to-seo-meta)**         | Generate SEO title and description variations sized to Google's display limits (50–60 / 150–160 chars), with an optional primary keyword in each.                      |
| **[Article to Social Posts](https://odd-jobs.timonwa.com/article-to-social-posts)** | Turn an article URL or draft into platform-optimized posts for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack — with tone, voice, hashtag rules, and X threads. |

**Instant tools** — run entirely in your browser, no key, no account, nothing sent to a server.

| Tool                                                                      | What it does                                                                                 |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **[Case Converter](https://odd-jobs.timonwa.com/case-converter)**         | Switch text between UPPERCASE, Title Case, camelCase, snake_case, and more.                  |
| **[Hash Generator](https://odd-jobs.timonwa.com/hash-generator)**         | Hash text with SHA-1, SHA-256, SHA-384, and SHA-512, right in your browser.                  |
| **[Lorem Ipsum Generator](https://odd-jobs.timonwa.com/lorem-ipsum)**     | Generate placeholder paragraphs, sentences, or words in one click.                           |
| **[Reading Time Estimator](https://odd-jobs.timonwa.com/reading-time)**   | Estimate reading and speaking time, with a copy-ready “X min read” label.                    |
| **[Slug Generator](https://odd-jobs.timonwa.com/slug-generator)**         | Turn any title or headline into a clean, URL-safe slug.                                      |
| **[SVG to JSX Converter](https://odd-jobs.timonwa.com/svg-to-jsx)**       | Convert raw SVG markup into a clean React/JSX component.                                     |
| **[Word & Character Counter](https://odd-jobs.timonwa.com/word-counter)** | Live word, character, sentence, and reading-time counts, with per-platform character limits. |

_More on the way._

## How it works

- **Instant tools** — run fully in your browser. No key, no account, nothing leaves the page.
- **AI tools** — a daily free quota per tool, no account needed.
- **Bring your own key** — add a free [Google AI Studio](https://aistudio.google.com/api-keys) key in an AI tool's settings for unlimited runs. It stays in your browser, never on a server.
- **Copy-only** — the AI tools draft, you copy and post. No OAuth, no publishing, no stored credentials.
- **Newsletter** — one issue a month. Only your email is collected, and unsubscribing is one click.

## Run locally

**Prerequisites:** Node.js 22 (see [`.nvmrc`](./.nvmrc)), [pnpm](https://pnpm.io), and a [Google AI Studio API key](https://aistudio.google.com/api-keys) if you want the AI tools.

```bash
git clone https://github.com/Timonwa/odd-jobs-by-timonwa.git
cd odd-jobs-by-timonwa
pnpm install
cp .env.example .env      # GOOGLE_API_KEY for the AI tools; the rest are optional locally
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable                                | Required                  | Purpose                                                                                                                                                      |
| --------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `APP_ENV`                               | on deploy                 | `production` or `development` (the default when unset). Gates analytics, and makes `IP_HASH_SECRET` mandatory                                                |
| `GOOGLE_API_KEY`                        | for hosted AI             | Gemini key behind the free quota. Without it the AI tools are bring-your-own-key only                                                                        |
| `UPSTASH_REDIS_REST_URL` / `..._TOKEN`  | for hosted AI             | Rate-limit counters. A built app that can't meter **refuses** hosted AI rather than spending the key unmetered                                               |
| `IP_HASH_SECRET`                        | when `APP_ENV=production` | Pepper for hashed IPs. The app **throws at boot** without it in production — an unkeyed IP hash is brute-forceable. Generate one with `openssl rand -hex 32` |
| `GOOGLE_API_KEY_ARTICLE_TO_SEO_META`    | —                         | Per-tool key override (falls back to `GOOGLE_API_KEY`)                                                                                                       |
| `GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST` | —                         | Per-tool key override                                                                                                                                        |

The app builds and the instant tools work with nothing set. **Hosted AI needs `GOOGLE_API_KEY` _and_ the two Upstash variables** — a build that can't meter refuses to spend the platform key, so one without the other leaves the AI tools BYOK-only. The dev server is exempt from metering, so local work needs no Upstash account. [`.env.example`](./.env.example) is the source of truth.

The model is not an environment variable: it's `HOSTED_LLM_MODEL` in [`src/lib/config/byok.ts`](./src/lib/config/byok.ts), committed and constrained to an allowlist so environments can't silently drift onto different models.

### Scripts

| Command              | What it does             |
| -------------------- | ------------------------ |
| `pnpm dev`           | Dev server (Turbopack)   |
| `pnpm build`         | Production build         |
| `pnpm start`         | Run the production build |
| `pnpm typecheck`     | `tsc --noEmit`           |
| `pnpm lint`          | ESLint                   |
| `pnpm format`        | Prettier — write         |
| `pnpm format:check`  | Prettier — check         |
| `pnpm test`          | Unit tests (Vitest)      |
| `pnpm test:watch`    | Unit tests, watch mode   |
| `pnpm test:coverage` | Unit tests with coverage |
| `pnpm test:e2e`      | E2E tests (Playwright)   |

CI gates five of these, in order: `lint`, `format:check`, `typecheck`, `test`, `build`. E2E runs on demand, not in CI — it needs `pnpm build` and a one-time `pnpm exec playwright install chromium` first.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, the [Vercel AI SDK](https://ai-sdk.dev/) + Gemini, and Upstash Redis.

## Contributing

Contributions are welcome — bug fixes, UX and accessibility improvements, agent-prompt tweaks, docs, and ideas for new tools. See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, scope, the codebase layout, and the PR workflow. By participating you agree to the [Code of Conduct](https://www.timonwa.com/coc).

The blog posts, newsletter issues, and product copy under `src/content/**` are my editorial work, so I don't take PRs against them — corrections and ideas are welcome as issues.

## Privacy

- **Bring-your-own keys** live in your browser's `sessionStorage`, cleared on tab close. They're sent with a request only to make that Gemini call on your behalf — never logged or stored.
- **Your input** is sent through the server to Google Gemini only for that request; not logged or stored (URL-based fetches are cached in memory for up to an hour). There's no database.
- **History, preferences, and templates** live only in your browser's `localStorage`.
- **Rate-limit counters** store a keyed (HMAC-SHA256) hash of your IP plus a daily count in Upstash Redis (resets at UTC midnight); bring-your-own-key requests skip this.
- **Newsletter signups** send only your email address, to my own [Listmonk](https://listmonk.app) instance. The form gives the same confirmation whether or not you were already subscribed, so it can't be used to test who's on the list.
- **No accounts, no profiles, no cross-site tracking.** Anonymous, cookieless usage analytics via [Umami](https://umami.is) — no personal data.

Full details: [www.timonwa.com/privacy](https://www.timonwa.com/privacy).

## Security

Please report vulnerabilities privately — see [SECURITY.md](./SECURITY.md). Don't open a public issue.

## License

This project is split between open-source **code** and reserved **content**:

- **Code** — all source (everything except `src/content/**`) is **AGPL-3.0**, see [LICENSE](./LICENSE). Use, modify, and self-host it freely; if you run a modified version as a public service, your source must stay public too.
- **Content** — `src/content/**` (blog posts, newsletter issues, product copy) is **© Timonwa, all rights reserved**, see [LICENSE-content](./LICENSE-content).
- **Brand** — the names and logos aren't covered by the code license, see [TRADEMARK.md](./TRADEMARK.md). Fork the code freely, but give your version its own name.

## Support

- ⭐️ [Star the repo](https://github.com/Timonwa/odd-jobs-by-timonwa)
- ❤️ [Support](https://www.timonwa.com/support)

---

Built by [Timonwa](https://links.timonwa.com). Open source · AGPL-3.0.
