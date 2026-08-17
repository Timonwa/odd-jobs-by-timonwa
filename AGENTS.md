<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — The Productivity Bug

A productivity hub for writers, developers, and creators — free single-purpose web tools (AI-assisted and client-only), plus a blog, newsletter archive, and digital-product shop. Keep the block above intact — it's auto-managed. For the full tool anatomy and dev setup, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Tech Stack

- **Project type / tooling**: single Next.js app, pnpm (`pnpm-workspace.yaml` holds pnpm settings only — not a monorepo)
- **Framework**: Next.js 16 (App Router; `cacheComponents`, `typedRoutes`, `reactCompiler` all on; MDX via `@next/mdx`)
- **Language**: TypeScript strict, React 19
- **Rendering**: Server Components by default; `"use client"` only on interactive leaves (tools, pickers, drawers)
- **Styling**: Tailwind CSS v4 (CSS-first; no class prefix — single app)
- **Validation**: Zod — content frontmatter in `lib/schemas/`, env in `lib/config/env.ts`, action inputs in the action files
- **Auth**: None — no accounts, no sessions
- **Data store**: None — content is MDX in `src/content/`; Upstash Redis only for hosted rate limiting
- **AI**: Vercel AI SDK + Gemini (`@ai-sdk/google`); BYOK keys live in the browser's `sessionStorage`, never on a server
- **Code quality**: ESLint (flat config, jsx-a11y gates CI) + Prettier; husky + lint-staged pre-commit

Language / framework standards (bucket A — enforced everywhere, detail in the named skills): `typescript-best-practices`, `react-best-practices`, `nextjs-best-practices`, `tailwind-css` + `design-system` + `frontend-design` + `html-best-practices` + `accessibility`, `branding`, `code-structure`, `naming`, `reusables`, `frontend-security` / `backend-security`, `devops`, `writing-standards` / `readme-standards`. Audits are manual on request (`audit-all` or a single domain audit).

## What this is (two kinds of tool)

- **AI tools** (Article to SEO Meta, Article to Social Posts) — a `"use server"` action calls Gemini. Action in `lib/server/actions/<slug>.action.ts`, agent in `lib/server/services/<name>.service.ts`.
- **Client-only tools** (Word Counter, Case Converter, Slug Generator, Reading Time, …) — run entirely in the browser; no server code.

`TOOLS` in `lib/config/tools.ts` is the single registry — one entry wires a tool into the home grid, navbar, and sitemap.

## Repository Structure

```txt
app/                       thin routes only: metadata, static params, guards → render a …PageContent
  (tools)/<slug>/          grouping-only route group; tools live at root URLs (/word-counter)
  blog/ newsletter/ shop/  content sections; /guides 308-redirects to /blog
src/styles/                globals.css + tokens/theme/base partials, imported in order
src/components/
  ui/                      app-agnostic reusables in 4 tiers: base/ blocks/ patterns/ layouts/ (one folder per component, index.tsx is the component; tier + root barrels)
  _shared/                 cross-feature app-specific: writer/ (engine), category/, result/, source/, page/, byok/, content/, tool/, layout/ (navbar, footer, shell)
  errors/                  framework boundaries: ErrorContent, NotFoundContent, GlobalErrorContent
  home/ categories/ tools/<slug>/ blog/ newsletter/ shop/   feature folders mirroring routes
src/lib/                   kind-first, flat inside each kind; barrel per kind, one explicit export line per file (never export *)
  config/                  bare names: env, routes, site, tools, byok, categories, tints, social-posts-writer
  constants/               <domain>.constant.ts — frozen values + their inferred types
  data/                    <domain>.data.ts — static page copy
  hooks/                   use-<subject>.ts (+ writer/ concern group); hooks only — factories live in utils
  schemas/                 <domain>.schema.ts — Zod schema + inferred meta type together
  types/                   <domain>.type.ts — shapes with no const or schema behind them
  utils/                   client-safe: <domain>.utils.ts flat, or a domain folder whose files are <concern>.utils.ts (text/ svg/ storage/ writer/); cn.ts is the one bare name
  server/                  server-only boundary; @/lib/server barrel (marked server-only) exports services only
    actions/               <domain>.action.ts — barrel importable from client components
    services/              <domain>.service.ts — content loaders + AI agents
    clients/               <service>.client.ts — configured SDK singletons (gemini)
    utils/                 ai/ (*.utils.ts), rate-limit.utils.ts, og-image.utils.tsx, create-mdx-loader.utils.ts
src/content/               MDX: blog/, issues/, shop/, tools/ (all rights reserved — see LICENSE-content)
public/                    assets: logo.png, blog/ images, PWA icons
```

Conventions (full detail in `code-structure`):

- **Thin entries.** `page.tsx` holds only framework surface (metadata, `generateStaticParams`, guards) and renders a named `…PageContent` composed in `components/<feature>/<page>/index.tsx` from one-file-per-section components. Boundary entries (`error.tsx`, `not-found.tsx`, `global-error.tsx`) render from `components/errors/`.
- **Components hold `.tsx` only** — hooks/constants/types live in `lib/`. Named exports everywhere.
- **`schemas/` owns Zod schemas and their inferred types together** (`post.schema.ts` → `PostMeta`) — never re-declare an inferred type in `types/`.
- **Never share a barrel between server-only and client-safe code.** Everything outside `lib/server/` is client-safe.
- **Reuse the shared layer.** Before adding plumbing, check `lib/server/` (`createGeminiClient` in `clients/`, plus `resolvePlatformApiKey`, `enforceDailyQuota`, `generateSchemaOutputFromArticle`, `resolveArticleSource`, `toUserMessage` in `utils/ai/`), `lib/utils/` (client-safe: `isBrowser`, `articleSourceIdentity`, the `createLocalStore`/`createHistoryStore`/`createWriterStorage` factories in `storage/`), and `components/_shared/` (incl. the `writer/` engine — `Writer`, `useWriter`, `WriterRuntime` — and `JsonLdScript`).
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
# no tests
```

**Verify before you claim done — run all three; never report success on an unverified change:** `pnpm typecheck && pnpm lint && pnpm build`. Prettier and the pre-commit hook handle formatting.

## Git

- **Default / base branch**: `main`; active integration branch: `dev` (feature PRs target `dev`).
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

Tailwind v4, CSS-first. `src/styles/` is one entry (`globals.css`) importing layered partials (tokens, theme, base) in order. Dark mode is class-toggled (`.dark` on `<html>`) with a pre-hydration script in the root layout to avoid FOUC. Semantic tokens over literals. Detail: `tailwind-css`.

## Routing

App Router. `(tools)` is a grouping-only route group — tool URLs sit at the root (`/word-counter`). Content sections are plain segments: `/blog`, `/newsletter`, `/shop`, `/categories`. `/guides` and `/guides/:slug` 308-redirect to `/blog` (in `next.config.ts`). All page paths come from `ROUTES` in `lib/config/routes.ts` — never hardcode a path. There is no API/route-handler layer, so no `endpoints.ts`.

## Data Fetching

Server Components call the content loaders from `@/lib/server` (`getAllPosts`, `getIssue`, `getProduct`, …) — filesystem MDX reads validated by `lib/schemas/`. Client tools compute in the browser; no fetch hooks exist and none should be added. Article-URL input is fetched server-side inside actions (SSRF-guarded by `assertSafeArticleUrl`; 1-hour in-memory cache).

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
- **SSRF**: article URLs pass `assertSafeArticleUrl` (blocks loopback, link-local/metadata endpoint, RFC 1918, IPv6 local ranges).
- **Rate limiting**: per-user (HMAC-SHA256 IP hash, peppered by `IP_HASH_SECRET`) + shared daily pool in Upstash Redis, production only, fails open; BYOK requests skip it.
- **JSON-LD** is escaped via `JsonLdScript` (`<` → `<`).
- No secrets in the client bundle; no `NEXT_PUBLIC_*` vars are used.

## Backend / API

No API layer — Server Actions only. Hosted quota budgets live in `lib/constants/` (`SEO_META_DAILY_USER_CAP` / `SEO_META_DAILY_SHARED_POOL`, `SOCIAL_POST_DAILY_USER_CAP` / `SOCIAL_POST_DAILY_SHARED_POOL`); counters are Redis keys `ratelimit:<toolSlug>:user|pool:<date>`, reset at UTC midnight.

## Data Store (Firebase / other)

None. Content is MDX under `src/content/` (`blog/`, `issues/`, `shop/`, `tools/`), loaded by `lib/server/services/` through `create-mdx-loader.utils.ts` (slug allowlist `^[a-z0-9-]+$`, frontmatter validated at build, reading time derived). Unpublished drafts go in `src/content/**/_drafts/` (gitignored). Tool input is request-scoped — not logged or cached.

## Monorepo / Workspace

None (single app). `pnpm-workspace.yaml` exists only to pin `postcss >= 8.5.10` against a vulnerability Next still transitively pins — re-check on Next upgrades.

## CI/CD & Deploy

`.github/workflows/ci.yml` gates PRs. Hosted on Vercel; `APP_ENV=production` is set explicitly on deploy (unset = `development`) and gates rate limiting + Umami analytics.

## Env Vars & Config

**Secrets** (validated in `src/lib/config/env.ts`, imported as `@env`; all optional — features degrade gracefully when unset): `GOOGLE_API_KEY` (hub Gemini key), `GOOGLE_API_KEY_ARTICLE_TO_SEO_META` / `GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST` (per-tool overrides, blank falls back to the hub key), `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, `IP_HASH_SECRET`, `SENDER_API_TOKEN`. Every one appears in `.env.example` with no value.

**Per-tier constants**: `APP_ENV` (`development` | `production`) and `LLM_MODEL` (default `gemini-flash-lite-latest` — always a `-latest` alias; Google 404s pinned older models). Site URLs and external links live in `lib/config/site.ts`.

**Namespaced keys + events**: every localStorage/sessionStorage key and custom DOM event is built via `namespaced()` as `tbt:<area>:<name>` — keys in `constants/storage-keys.constant.ts`, events in `constants/events.constant.ts`. Never inline a raw key/event string.

## i18n

None — English only.

## Testing & Stories

- **Tests** — None today; don't add a test framework without asking.
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
- Run `pnpm lint && pnpm typecheck && pnpm format:check` before submitting

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

- Run `pnpm typecheck && pnpm lint && pnpm build` before claiming done
- Validate inputs with Zod (frontmatter via `lib/schemas/`, env via `@env`, action inputs in the action)
- Keep semantic HTML + a11y intact — real elements, labels, focus order, keyboard paths; jsx-a11y gates CI
- Specific, self-contained copy — name the subject; no vague headings or deixis
- Comments only when non-obvious — if deleting a comment wouldn't confuse a future reader, don't write it
- No scope creep — refactors, renames, and unrelated cleanups go in their own change

## Documentation

README.md (user-facing) + CONTRIBUTING.md (tool anatomy, dev setup, PR workflow). The local `docs/` folder is private and gitignored. Licensing is split: code AGPL-3.0 (`LICENSE`), content reserved (`LICENSE-content`), brand reserved (`TRADEMARK.md`).

## Troubleshooting

- Gemini returns 404 → the model id is pinned; use a `-latest` alias in `LLM_MODEL`.
- Rate limiting seemingly off locally → intentional; it only activates with `APP_ENV=production` + Upstash vars set.
- `postcss` audit warning after a Next upgrade → re-check the `pnpm-workspace.yaml` pin.
