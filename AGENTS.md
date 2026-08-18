<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — The Productivity Bug

A productivity hub for writers, developers, and creators — free single-purpose web tools (AI-assisted and client-only), plus a blog, newsletter archive, and digital-product shop. Keep the block above intact — it's auto-managed. For the full tool anatomy and dev setup, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Tech Stack

- **Project type / tooling**: single Next.js app, pnpm (not a monorepo — `pnpm-workspace.yaml` exists for `allowBuilds` + security version floors)
- **Framework**: Next.js 16 (App Router; `cacheComponents`, `typedRoutes`, `reactCompiler` all on; MDX via `@next/mdx`)
- **Language**: TypeScript strict, React 19
- **Rendering**: Server Components by default; `"use client"` only on interactive leaves (tools, pickers, drawers)
- **Styling**: Tailwind CSS v4 (CSS-first; no class prefix — single app)
- **Validation**: Zod — all schemas in `lib/schemas/` (content frontmatter _and_ action inputs), env in `lib/config/env.ts`. Actions apply theirs via `parseActionInput` as their first statement
- **Auth**: None — no accounts, no sessions
- **Data store**: None — content is MDX in `src/content/`; Upstash Redis only for hosted rate limiting
- **AI**: Vercel AI SDK + Gemini (`@ai-sdk/google`); BYOK keys live in the browser's `sessionStorage`, never on a server
- **Code quality**: ESLint (flat config, jsx-a11y gates CI) + Prettier; husky + lint-staged pre-commit

Language / framework standards (bucket A — enforced everywhere, detail in the named skills): `typescript-best-practices`, `react-best-practices`, `nextjs-best-practices`, `tailwind-css` + `design-system` + `frontend-design` + `html-best-practices` + `accessibility`, `branding`, `code-structure`, `naming`, `reusables`, `frontend-security` / `backend-security`, `devops`, `writing-standards` / `readme-standards`. Audits are manual on request (`audit-all` or a single domain audit).

## What this is (two kinds of tool)

- **AI tools** (Article to SEO Meta, Article to Social Posts) — a `"use server"` action calls Gemini. Action in `lib/server/actions/<domain>.action.ts`, agent in `lib/server/services/<domain>.service.ts` — the domain is the short name (`seo-meta`), not the route slug (`article-to-seo-meta`).
- **Client-only tools** (Word Counter, Case Converter, Slug Generator, Reading Time, …) — run entirely in the browser; no server code.

`TOOLS` in `lib/config/tools.ts` is the single registry — one entry wires a tool into the home grid, navbar, and sitemap.

## Repository Structure

```txt
src/app/                   thin routes only: metadata, static params, guards → render a …PageContent
  layout.tsx               root shell: fonts, metadata base, pre-hydration theme script, SiteLayout
  (hub)/                   layout-bearing group — renders HubNavbar once for everything inside it
    page.tsx               home
    tools/ categories/     tools directory + category pages
    blog/ newsletter/ shop/  content sections; /guides 308-redirects to /blog
  (tools)/<slug>/          grouping-only group, no layout of its own; tools live at root URLs (/word-counter)
  sitemap.ts robots.ts manifest.ts      metadata routes
  opengraph-image.tsx twitter-image.tsx  site-level social cards
  error.tsx not-found.tsx global-error.tsx loading.tsx
src/mdx-components.tsx     MDX element mapping — the file @next/mdx requires
src/styles/                globals.css imports these in order: tokens, theme, base, components, utilities, animations
src/components/
  ui/                      app-agnostic reusables in 4 tiers: base/ blocks/ patterns/ layouts/ (one folder per component, index.tsx is the component; tier + root barrels)
  _shared/                 cross-feature app-specific: writer/ (engine), category/, result/, source/, page/, byok/, content/, tool/, layout/ (navbar, footer, shell)
  errors/                  framework boundaries: ErrorContent, NotFoundContent, GlobalErrorContent
  home/ categories/ tools/<slug>/ blog/ newsletter/ shop/   feature folders mirroring routes
src/lib/                   kind-first, flat inside each kind; barrel per kind, one explicit export line per file
  config/                  bare names: env, routes, site, tools, byok, categories, tints, social-posts-writer (barrel excludes env — it is server-only)
  constants/               <domain>.constant.ts — frozen values + their inferred types
  data/                    <domain>.data.ts — static page copy
  hooks/                   use-<subject>.ts (+ writer/ concern group); hooks only — factories live in utils
  schemas/                 <domain>.schema.ts — Zod schema + inferred meta type together
  types/                   <domain>.type.ts — shapes with no const or schema behind them
  utils/                   client-safe: <domain>.utils.ts flat, or a domain folder whose files are <concern>.utils.ts (text/ svg/ storage/ writer/); cn.ts is the one bare name
  server/                  server-only boundary; @/lib/server barrel (marked server-only) exports services only
    actions/               <domain>.action.ts — barrel importable from client components
    services/              <domain>.service.ts — content loaders + AI agents
    clients/               <service>.client.ts (gemini), or <service>/ when a client needs more than a singleton (redis/: client, keys, ttl)
    utils/                 ai/ (*.utils.ts), rate-limit.utils.ts, og-image.utils.tsx, create-mdx-loader.utils.ts
src/content/               MDX: blog/, issues/, shop/, tools/ (all rights reserved — see LICENSE-content)
public/                    assets: logo.png, blog/ images, PWA icons
```

Conventions (full detail in `code-structure`):

- **Thin entries.** `page.tsx` holds only framework surface (metadata, `generateStaticParams`, guards) and renders a named `…PageContent` composed in `components/<feature>/<page>/index.tsx` from one-file-per-section components. Boundary entries (`error.tsx`, `not-found.tsx`, `global-error.tsx`) render from `components/errors/`.
- **Components hold `.tsx` only** — hooks/constants/types live in `lib/`. Named exports everywhere.
- **`schemas/` owns Zod schemas and their inferred types together** (`post.schema.ts` → `PostMeta`) — never re-declare an inferred type in `types/`.
- **Never share a barrel between server-only and client-safe code.** Everything outside `lib/server/` is client-safe. `lib/config/index.ts` deliberately omits `env.ts` for this reason — it keeps the separate `@env` alias.
- **Barrels list one explicit export line per file.** The one exception is `components/ui/index.ts`, which re-exports its four tier barrels with `export *`; every `lib/` barrel is explicit.
- **Reuse the shared layer.** Before adding plumbing, check `lib/server/` — `utils/ai/` holds **`parseActionInput` (required: every action's first statement)**, `assertSafeArticleUrl` (the SSRF guard), `resolvePlatformApiKey`, `enforceDailyQuota`, `getHostedQuotaStatus`, `generateSchemaOutputFromArticle`, `withResolvedArticleUrl`, `resolveArticleSource`, `toUserMessage`; `clients/` holds `createGeminiClient` and the `redis/` module; `utils/rate-limit.utils.ts` holds `canServeHostedAi`. Then `lib/utils/` (client-safe: `isBrowser`, `articleSourceIdentity`, `assertToolSlug`/`parseToolFaq`, the `createLocalStore`/`createHistoryStore`/`createWriterStorage` factories in `storage/`), and `components/_shared/` (incl. the `writer/` engine — `Writer`, `useWriter`, `WriterRuntime` — plus `JsonLdScript`, `ContentBreadcrumbs`, `ContentByline`).
- Path alias `@/*` (and `@env` for `lib/config/env.ts`).

## Setup & Commands

Package manager: **pnpm** (lockfile: `pnpm-lock.yaml`).

```bash
pnpm install         # install deps
pnpm dev             # run locally (Turbopack)
pnpm build           # production build
pnpm typecheck       # tsc --noEmit — used to verify fixes
pnpm lint            # eslint .
pnpm format          # prettier --write
pnpm format:check    # prettier --check
pnpm test            # unit tests (Vitest) — CI-gated
pnpm test:watch      # unit tests in watch mode
pnpm test:coverage   # unit tests with V8 coverage
```

**Verify before you claim done — never report success on an unverified change.** Run the exact set CI gates, in order:

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build
```

Full script table: [README.md](./README.md#scripts) — one home for it, linked from here and CONTRIBUTING.

## Git

- **Branch model**: `main` is the default branch and tracks what's deployed; `dev` is the integration branch and all PRs target it. Stated once in [CONTRIBUTING.md](./CONTRIBUTING.md#workflow) — if these ever disagree, that file wins.
- **Branch naming**: `type/short-kebab-description` (`feat/…`, `fix/…`, `docs/…`).
- **Protected branches** (never push directly): `main`, `dev`.
- **Never commit, push, or open a PR unless the user explicitly asks.** Staging to show a diff is fine; committing is not.
- **Stage only files you changed this session** — don't sweep in pre-existing modifications; the pre-commit hook re-stages, so check `git status` first.

## Naming Conventions

| What                                   | Convention                              | Example                                  |
| -------------------------------------- | --------------------------------------- | ---------------------------------------- |
| Component props                        | `Props` suffix                          | `SearchInputProps`                       |
| Zod schema (the value)                 | `Schema` suffix                         | `PostFrontmatterSchema`, `SeoMetaSchema` |
| Inferred / domain / union type         | clean PascalCase, no suffix             | `PostMeta`, `ArticleSource`              |
| Constants (incl. `as const`)           | `UPPER_SNAKE_CASE`                      | `POST_SLUGS`, `STORAGE_KEYS`             |
| Components                             | PascalCase, feature-prefixed when local | `SeoMetaHero`, `HomeHero`                |
| Component / story files                | PascalCase (match the export)           | `SearchInput.tsx`                        |
| All other files (hooks, utils, config) | kebab-case                              | `use-theme.ts`, `hash.utils.ts`          |
| Page components                        | `PageContent` suffix                    | `BlogPageContent`                        |

**Identifiers** — verb-first functions (`get` sync/local, `fetch` async/remote, `create`/`build`/`format`/`parse`, `handle*` handlers, `on*` callback props); hooks `use*`; booleans as assertions (`is`/`has`/`can`). File name = export name = usage — never rename on import (`import X as Y`). Descriptive over terse (`createGeminiClient`, not `getGemini`). Full standard: the `naming` skill.

Import order: React first, then external packages, then internal (`@/*`), then relative.

## Styling

Tailwind v4, CSS-first. `src/styles/` is one entry (`globals.css`) importing six layered partials in order: tokens, theme, base, components, utilities, animations. Repeated class strings belong in `components.css`; one-off helpers in `utilities.css`. Dark mode is class-toggled (`.dark` on `<html>`) with a pre-hydration script in the root layout to avoid FOUC. Semantic tokens over literals. Detail: `tailwind-css`.

## Routing

App Router, with two route groups that differ in kind. `(hub)` is **layout-bearing**: its `layout.tsx` renders `HubNavbar` once for home, `/tools`, `/categories`, `/blog`, `/newsletter`, and `/shop` — a new content section created outside it silently loses the navbar. `(tools)` is **grouping-only** and has no layout, so tool URLs sit at the root (`/word-counter`). Neither group name appears in a URL. `/guides` and `/guides/:slug` 308-redirect to `/blog` (in `next.config.ts`). All page paths come from `ROUTES` in `lib/config/routes.ts` — never hardcode a path. There is no API/route-handler layer, so no `endpoints.ts`.

## Data Fetching

Server Components call the content loaders from `@/lib/server` (`getAllPosts`, `getIssue`, `getProduct`, …) — filesystem MDX reads validated by `lib/schemas/`. Client tools compute in the browser; no fetch hooks exist and none should be added. **Article URLs are never fetched by this app** — `resolveArticleSource` validates the URL with `assertSafeArticleUrl` and hands it to Gemini's provider-executed `url_context` tool, which does the reading. So the SSRF guard constrains what we _ask Gemini to fetch_, not our own egress, and there is no response body or cache on our side. The only outbound `fetch` in `lib/server/` is the Sender.net call in `newsletter.action.ts`.

## Mutations

Server Actions only, in `lib/server/actions/<domain>.action.ts` (`generateSeoMeta`, `generateSocialPosts`, `subscribeNewsletter`). Inputs validated with Zod in the action; AI outputs validated against the agent's schema. No route handlers.

## Caching

`cacheComponents: true` is on. No `use cache` readers exist yet — content is prerendered via `generateStaticParams`. When cached readers become necessary, add them as `lib/server/cache/<domain>.cache.ts` with `cacheLife` tiers + `cacheTag`, per `nextjs-best-practices`.

## Brand & Voice

**The Productivity Bug** (`SITE_NAME` etc. in `lib/config/site.ts`). Voice: specific, self-contained copy — name the subject, no vague headings or deixis ("the box", "here"); UI text stands alone. Sentence case. Logo: `public/logo.png` (PNG only today; an SVG with the standard `logo.svg` stem is the desired end state). Creator: Timonwa Akintokun (`@timonwa_`); external links point at `www.timonwa.com`.

## SEO

Site: `https://tools.timonwa.com` (`SITE_URL`). Per-route `metadata` exports; per-page OG/Twitter images via `renderOgImage` (`lib/server/utils/og-image.utils.tsx`); JSON-LD via the shared `JsonLdScript`. `sitemap.ts` covers home, the tools directory, categories, live tools ("soon" tools are excluded), blog, newsletter, and the shop index; **shop product pages canonicalize to `www.timonwa.com/shop/<slug>`** (`SHOP_CANONICAL_BASE`) and are omitted from the sitemap.

## DevRel

None.

## Help centre

None.

## Auth & RBAC

None — no accounts. The only gating is the hosted daily quota (see Backend / API).

## Security

- **BYOK keys** live in `sessionStorage` (browser only), sent per-request, never logged or stored server-side. Only allowlisted BYOK models are honored (`BYOK_MODELS`).
- **SSRF**: article URLs pass `assertSafeArticleUrl` (blocks loopback, link-local/metadata endpoint, RFC 1918, IPv6 local ranges) before being handed to Gemini's `url_context` — the app never fetches them itself, so this bounds what the provider is asked to read.
- **Rate limiting**: three tiers in Upstash Redis — per-user daily, per-user burst, and a shared daily pool — charged atomically by one Lua script, keyed on an HMAC-SHA256 IP hash peppered by `IP_HASH_SECRET`. **Metering follows the Upstash credentials, not the tier**: only the dev server is exempt, so every built deploy meters (previews included). An unreachable Redis **fails closed** — `canServeHostedAi()` returns false and hosted generations are refused rather than spending the platform key unmetered. BYOK requests skip all of it.
- **Security headers**: a `Content-Security-Policy` plus five others, served on every path from `headers()` in `next.config.ts` (no middleware — there's no other dynamic surface). A new external script, font, or frame source needs a CSP edit in the same PR, or it is blocked in the browser.
- **JSON-LD** is escaped via `JsonLdScript`: `<` becomes `\u003c`, so a `</script>` inside content can't break out of the tag.
- No secrets in the client bundle; no `NEXT_PUBLIC_*` vars are used.

## Backend / API

No API layer — Server Actions only. Quota budgets live in `lib/constants/`: `SEO_META_DAILY_USER_CAP` / `SEO_META_DAILY_SHARED_POOL`, `SOCIAL_POST_DAILY_USER_CAP` / `SOCIAL_POST_DAILY_SHARED_POOL`, and `NEWSLETTER_DAILY_USER_CAP` / `NEWSLETTER_DAILY_SHARED_POOL` / `NEWSLETTER_BURST_CAP` — the newsletter action is metered too, because it writes to Sender.net with the server token. `subscribeNewsletter` also has a honeypot field (`NEWSLETTER_HONEYPOT_FIELD`), hidden from people and assistive tech; don't remove it as dead markup.

Every key is built in `lib/server/clients/redis/keys.ts` — grep that one file to see the whole keyspace — and every key gets a TTL from `ttl.ts`, because an un-expiring key is a permanent cost leak. The three shapes, all reset at UTC midnight except the burst window:

```txt
rl:<APP_ENV>:<toolSlug>:user:<ipHash>:<date>
rl:<APP_ENV>:<toolSlug>:pool:<date>
rl:<APP_ENV>:<toolSlug>:burst:<ipHash>:<windowStart>
```

The `<APP_ENV>` scope is load-bearing: one Upstash database serves every environment, so without it a preview deploy would spend production's shared pool.

## Data Store (Firebase / other)

None. Content is MDX under `src/content/`, in two shapes:

- **`blog/`, `issues/`, `shop/`** — YAML frontmatter, loaded by `lib/server/services/` through `create-mdx-loader.utils.ts`: slug allowlist `^[a-z0-9-]+$`, frontmatter validated against `lib/schemas/` at build, reading time derived.
- **`tools/`** — no frontmatter; each file exports a `faq` const, so there is nothing for the loader to parse and these get no loader. `ToolContent` imports them directly, guarded by `assertToolSlug` (checks the `TOOLS` registry before the slug reaches a dynamic import) and `parseToolFaq` (Zod, because the FAQ becomes FAQPage JSON-LD). Both live in `lib/utils/tool-content.utils.ts`.

Unpublished drafts go in `src/content/**/_drafts/` (gitignored), read only by the dev server — gated on `NODE_ENV`, not `APP_ENV`, so no build can emit one. Tool input is request-scoped — not logged or cached.

## Monorepo / Workspace

None (single app). `pnpm-workspace.yaml` is the repo's dependency-security surface, not workspace config: it holds an `allowBuilds` allowlist (pnpm 11 blocks install scripts by default) and version floors for transitive dependencies Next pins below their patched releases. Each floor carries its advisory IDs inline — **read the file before changing it**, because two entries are subtler than they look: `js-yaml`'s `<4` ceiling is required (v4 dropped the `safeLoad` that `gray-matter` calls, so forcing it breaks frontmatter parsing at build), and `brace-expansion` is deliberately _not_ overridden (pinning the patched version breaks `pnpm lint`). Re-check the floors on Next upgrades.

## CI/CD & Deploy

`.github/workflows/ci.yml` gates PRs; `label.yml` (path labels from `labeler.yml`), `auto-assign.yml`, and `release-notes.yml` (release-drafter, config in `.github/release-notes.yml`) automate the rest. **SAST is GitHub's default CodeQL setup, configured in repo settings rather than a workflow** — a custom `codeql.yml` alongside the default setup fails every PR ("CodeQL analyses from advanced configurations cannot be processed when the default setup is enabled"), so don't re-add one without switching the repo to Advanced first. Dependabot manages dependencies — security alerts + fix PRs (always on) and grouped weekly version updates (`.github/dependabot.yml`). Deliberately absent for a solo-maintained open-source repo: commitlint hooks, a PR-title check, `CODEOWNERS`, and `stale.yml`. Hosted on Vercel; `APP_ENV=production` is set explicitly on deploy (unset = `development`) and gates rate limiting + Umami analytics.

## Env Vars & Config

**Secrets** (validated in `src/lib/config/env.ts`, imported as `@env`; a blank value normalizes to absent, so `KEY=""` placeholders don't fail validation): `GOOGLE_API_KEY` (hub Gemini key), `GOOGLE_API_KEY_ARTICLE_TO_SEO_META` / `GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST` (per-tool overrides, blank falls back to the hub key), `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, `IP_HASH_SECRET`, `SENDER_API_TOKEN`. Every one appears in `.env.example` with no value.

Optional in the schema, but **two are load-bearing at runtime and don't degrade gracefully**:

- `IP_HASH_SECRET` — `rate-limit.utils.ts` **throws at module load** when `APP_ENV=production` and it's unset, so the app doesn't boot. An unkeyed SHA-256 of an IPv4 address is brute-forceable, which would turn rate-limit keys into recoverable personal data.
- `UPSTASH_REDIS_REST_URL` / `_TOKEN` — without them a built app can't meter, so hosted generations are **refused** rather than served on an uncapped platform key. `GOOGLE_API_KEY` alone is not enough outside the dev server.

**Per-tier constant**: `APP_ENV` (`development` | `production`). The Gemini model is **not** env-held — it's `HOSTED_LLM_MODEL` in `lib/config/byok.ts`, committed and constrained to the `ByokModel` allowlist so staging and production can't drift onto different models without review. Site URLs and external links live in `lib/config/site.ts`.

**Namespaced keys + events**: every localStorage/sessionStorage key and custom DOM event is built via `namespaced()` as `tbt:<area>:<name>` — keys in `constants/storage-keys.constant.ts`, events in `constants/events.constant.ts`. Never inline a raw key/event string.

## i18n

None — English only.

## Testing & Stories

- **Tests** — Vitest, two projects in `vitest.config.mts`: `node` (utils, schemas, `lib/server` — the `server-only` package is aliased to `test/mocks/server-only.ts`) and `dom` (jsdom + Testing Library for hooks, storage utils, and components; `vitest.setup.ts` wires jest-dom matchers and RTL cleanup). Tests are colocated (`<name>.test.ts` / `<Component>.test.tsx`) and use explicit `vitest` imports — no globals. A file that needs the other environment overrides with a `// @vitest-environment` pragma. Security-critical paths (SSRF guard, rate-limit fail-closed, BYOK key handling, action input validation, key redaction in logs) must keep their tests when refactored. No E2E yet — Playwright is the planned next layer.
- **Storybook** — None today; when added, follow `storybook-setup` / `storybook-story-writing` (CSF3, tiered titles matching `components/ui`).

## Commit Messages

Conventional Commits (no commitlint installed — the discipline is manual):

```txt
type(scope): subject
```

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **Scopes**: the area touched (`ui`, `lib`, `blog`, `shop`, `seo-meta`, `site`, …)
- Subject: lowercase start, imperative, no trailing period; every line ≤ 100 chars
- Staged, per-group review-gated commits via the `stage-commit` skill.

## PR Guidelines

- Title follows conventional-commit format
- PR template: `.github/pull_request_template.md`
- Run the same five gates as CI: `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build`

## Boundaries

### Never

- Commit or push without explicit permission
- Commit secrets, `.env*`, or service-account keys
- Push directly to `main` or `dev`
- Hand-edit the lockfile; use `pnpm install` (never another package manager)
- Disable TypeScript strict mode or linter rules
- Remove existing comments unless factually wrong
- Pull anything under `lib/server/` into a client bundle
- Accept content PRs — `src/content/**` is the maintainer's editorial material (see LICENSE-content)

### Always

- Run `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` before claiming done — the CI set
- Validate inputs with Zod (frontmatter via `lib/schemas/`, env via `@env`, action inputs in the action)
- Keep semantic HTML + a11y intact — real elements, labels, focus order, keyboard paths; jsx-a11y gates CI
- Specific, self-contained copy — name the subject; no vague headings or deixis
- Comments only when non-obvious — if deleting a comment wouldn't confuse a future reader, don't write it
- No scope creep — refactors, renames, and unrelated cleanups go in their own change

## Documentation

The full committed surface, with what each owns:

| File                          | Owns                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `README.md`                   | User-facing: tool list, quickstart, env table, privacy. The env table is the source of truth readers use — keep it exact |
| `CONTRIBUTING.md`             | Dev setup, the scripts table, codebase layout, tool anatomy, branch + PR workflow                                        |
| `AGENTS.md`                   | This file — agent-facing conventions. `CLAUDE.md` is a one-line `@AGENTS.md` import                                      |
| `SECURITY.md`                 | Disclosure policy, in/out of scope, what is stored where                                                                 |
| `TRADEMARK.md`                | Brand reservation (names and logos are outside the code licence)                                                         |
| `LICENSE` / `LICENSE-content` | Code AGPL-3.0; `src/content/**` all rights reserved                                                                      |
| `.github/`                    | Issue templates, PR template, workflow comments                                                                          |
| `public/llms.txt`             | AI-crawler policy + key-page list — **update it whenever a section or a key URL changes**                                |
| `_reports/`                   | Committed audit reports, one per domain plus `audit-all.md`. A fix pass updates its report in the same commit as the fix |

The local `docs/` folder is private and gitignored.

## Troubleshooting

- Gemini returns 404 → the model id is pinned; `HOSTED_LLM_MODEL` in `lib/config/byok.ts` must be a `-latest` alias (Google 404s pinned older models for newly-created keys). It is a committed constant, not an env var — setting `LLM_MODEL` anywhere does nothing.
- Rate limiting seemingly off locally → intentional; the dev server is the one exempt environment. Any _built_ app meters if it can and refuses hosted AI if it can't, regardless of `APP_ENV`.
- Hosted AI refuses with a platform key set → Upstash credentials are missing or wrong, so the request can't be metered. The boot log says so explicitly; check it before anything else.
- App won't boot in production → `IP_HASH_SECRET` is unset. It throws at module load by design.
- `postcss` (or other transitive) audit warning after a Next upgrade → re-check the floors in `pnpm-workspace.yaml`; raise the number rather than removing the entry, or the override keeps resolving a vulnerable version while looking like protection.
