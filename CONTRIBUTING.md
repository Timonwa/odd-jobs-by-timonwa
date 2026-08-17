# Contributing to The Productivity Bug

Thanks for your interest. **The Productivity Bug** is a productivity site (tools, blog, newsletter, and shop) whose **tools and code** are open source. New tools are added selectively to keep the collection focused, but the code is open and help is very welcome:

- 🐛 Bug fixes
- ✨ UX / accessibility polish on existing tools
- 🤖 Agent-prompt / output-quality improvements
- 📝 Docs
- 💡 **New-tool suggestions** — open an issue; if it fits, it may get built
- 🔧 Code toward a new or existing tool — coordinate via an issue first

By participating, you agree to the [Code of Conduct](https://www.timonwa.com/coc).

## Before you start

- **Questions or ideas / tool suggestions** → open an [issue](https://github.com/Timonwa/tools-by-timonwa/issues/new/choose).
- **Bugs** → use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
- **Feature requests** → use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
- **Larger changes (incl. a new tool)** → open an issue first so we can agree on scope before you invest time.

## Scope — what fits this project

✅ In scope

- Bug fixes and UX polish
- Accessibility improvements
- Agent draft quality (prompt tweaks, tone/voice refinements)
- New **text-first, single-purpose tools** — AI-backed or client-only — that fit the "does one thing well" shape (coordinate first)
- Performance, build, and CI improvements
- Documentation

❌ Out of scope (forks welcome)

- OAuth / auto-publishing — the tools are copy-only by design
- Scheduling, calendars, cron-based posting
- User accounts or stored profiles
- Anything that requires a database

If you're not sure, open an issue and ask.

## Dev setup

**Prerequisites:** Node.js 20.9+, [pnpm](https://pnpm.io), and a [Google AI Studio key](https://aistudio.google.com/api-keys).

```bash
git clone https://github.com/Timonwa/tools-by-timonwa.git
cd tools-by-timonwa
pnpm install
cp .env.example .env      # add at least GOOGLE_API_KEY
pnpm dev
```

Open `http://localhost:3000`. See the README for the full [environment variables](./README.md#environment-variables) table.

## Scripts

| Command             | What it does             |
| ------------------- | ------------------------ |
| `pnpm dev`          | Dev server (Turbopack)   |
| `pnpm build`        | Production build         |
| `pnpm start`        | Run the production build |
| `pnpm lint`         | ESLint                   |
| `pnpm format`       | Prettier — write         |
| `pnpm format:check` | Prettier — check         |

Type-check with `pnpm exec tsc --noEmit`. A `pre-commit` hook runs **lint-staged** (ESLint `--fix` + Prettier) on staged files via **husky**, so most formatting is automatic.

## Codebase layout

App Router with thin routes: every `page.tsx` holds only framework surface (metadata, static params, guards) and renders a `…PageContent` composed from section components. A tool's **UI** lives in `components/tools/<slug>/`; **server code** lives under the `lib/server/` boundary (no per-tool `lib/` folder). All components use **named exports** — file name, export name, and import name always match.

```text
app/
  layout.tsx  page.tsx                         # hub shell + landing
  manifest.ts  robots.ts  sitemap.ts           # SEO / PWA metadata routes
  icon.png  apple-icon.png  favicon.ico         # icons (Next metadata conventions)
  opengraph-image.tsx  twitter-image.tsx        # social share images
  error.tsx  not-found.tsx  global-error.tsx  loading.tsx
  (tools)/<slug>/                              # thin page.tsx + layout.tsx (metadata + JSON-LD)
  blog/  newsletter/  shop/                    # thin entries; sections in components/<feature>/
src/styles/                                    # globals.css + tokens/theme/base/... partials
components/
  ui/          # app-agnostic reusables in 4 tiers (barrel: @/components/ui)
    base/      # atoms: Button, Input, Badge, ... (one folder per component)
    blocks/    # composed: Card, Drawer, Section, ...
    patterns/  # page regions: PageHero
  _shared/     # cross-feature: writer/ (the shared engine), category/, result/,
               #   source/, page/, byok/, content/, tool/, layout/ (navbar, footer,
               #   page shell, ThemeToggle)
  errors/      # framework boundaries: ErrorContent, NotFoundContent, GlobalErrorContent
  home/  categories/                           # hub page compositions
  tools/       # index.tsx = /tools directory; <slug>/ = each tool's UI
  blog/        # blog index sections + post/ + _shared/ (MDX widgets)
  newsletter/  # archive sections + issue/
  shop/        # listing sections + product/
lib/                                           # kind-first, flat inside each kind
  config/      # env, routes, site, tools, byok, ... (bare names)
  constants/   # <domain>.constant.ts — frozen values + their inferred types
  data/        # <domain>.data.ts — static page copy records
  hooks/       # use-<subject>.ts (+ writer/ concern group)
  schemas/     # <domain>.schema.ts — Zod schemas + their inferred meta types
  types/       # <domain>.type.ts — shapes with no const or schema behind them
  utils/       # <domain>.utils.ts + text/ svg/ storage/ writer/ groups (client-safe)
  server/      # server-only boundary (barrel exports services; marked server-only)
    actions/   # <domain>.action.ts — "use server" actions (AI tools + newsletter)
    services/  # <domain>.service.ts — content loaders + AI agents
    clients/   # <service>.client.ts — configured SDK singletons (gemini)
    utils/     # ai/, rate-limit.utils.ts, og-image.utils.tsx, create-mdx-loader.ts
```

Every kind barrel lists one explicit export line per file — no `export *` from a directory.

## Anatomy of a tool

When building or extending a tool, reuse the shared layer rather than re-implementing plumbing:

1. **Route** — `app/(tools)/<slug>/page.tsx` (thin: import + render the content component) and `layout.tsx` (metadata + JSON-LD).
2. **UI** — `components/tools/<slug>/`: section components + an `index.tsx` composer, all **tool-prefixed** (`FooBarHero`, `FooBarTool`) and **named-exported**. Use primitives from `@/components/ui`. State hooks, constants, and types live in `lib/` (`hooks/`, `constants/`, `types/`), not the component folder.
3. **Server** _(AI tools only — client-only tools like the counters and converters stop at step 2)_ — `lib/server/actions/<slug>.action.ts` (a `"use server"` action) + `lib/server/services/<name>.service.ts` (the agent). Reuse from `@/lib/server/utils/ai`, `@/lib/server/clients`, and `@/lib/utils` (client-safe):
   - `generateSchemaOutputFromArticle` — runs the agent over a URL/text article source
   - `createGeminiClient` / `toTokenUsage` (`clients/gemini.client.ts`) — Gemini provider + usage mapping
   - `enforceDailyQuota` / `getHostedQuotaStatus` — hosted daily quota · `resolvePlatformApiKey` — server key
   - `resolveArticleSource` / `articleSourceErrorRules` / `toUserMessage` — validate the source, map errors
   - `createHistoryStore` (`@/lib/utils`) — local run history
4. **Register** — add an entry to `TOOLS` in `lib/config/tools.ts`. It then appears in the home grid, navbar menu, and sitemap automatically.

## Code style

- **Formatting / linting:** Prettier + ESLint (flat config). The pre-commit hook fixes most of it; run `pnpm lint` and `pnpm format` before pushing.
- **TypeScript:** strict mode is on. Don't `any` your way out — if a type is hard, ask in the PR.
- **No comments unless non-obvious.** If removing a comment wouldn't confuse a future reader, don't write it.
- **No scope creep.** Fix the thing in the issue. Refactors, renames, and unrelated cleanups go in separate PRs.
- **Accessibility matters.** Keep semantic HTML, labels, focus order, and keyboard paths intact when touching UI.

## Agent prompt changes

Each tool's agent lives under `lib/server/services/<name>.service.ts`. Prompt tweaks are welcome, but please:

- Include a **before/after example** in the PR — same input, old prompt vs. yours.
- Note any token-count impact (longer inputs = more cost per run).
- Test every input mode the tool supports (e.g. URL _and_ pasted text).

## Workflow

1. **Fork** and branch from `main`: `git checkout -b fix/what-you-are-fixing`.
2. **Make your change**, keeping the diff tight. Prefer editing existing files over creating new ones.
3. **Verify locally:**

   ```bash
   pnpm lint
   pnpm exec tsc --noEmit
   pnpm build
   ```

4. **Commit.** [Conventional Commits](https://www.conventionalcommits.org/) preferred — pick a type (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`) with a clear subject.
5. **Push and open a PR** against `main`. Fill out the PR template (what/why, how to test).

## Reporting security issues

Don't open a public issue for security bugs — use [GitHub's private security advisories](https://github.com/Timonwa/tools-by-timonwa/security/advisories/new). See [SECURITY.md](./SECURITY.md).

## License

This project splits licensing between **code** and **content**:

- **Code** — everything except `src/content/**` — is [AGPL-3.0](./LICENSE). By contributing code, you agree your work is released under it.
- **Content** — `src/content/**` (blog posts, newsletter issues, product copy) and the brand — is **not** open source (see [LICENSE-content](./LICENSE-content) and [TRADEMARK.md](./TRADEMARK.md)). It's the maintainer's editorial/personal material, so **content PRs aren't accepted**; typo fixes are fine via an issue.

Contribute to the tools and the code — that's what's open.
