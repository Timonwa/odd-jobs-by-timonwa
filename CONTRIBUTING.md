# Contributing to Odd Jobs

Thanks for your interest. **Odd Jobs** is free tools, guides, and templates for writers, developers, and creators (tools, blog, newsletter, and shop) whose **tools and code** are open source. New tools are added selectively to keep the collection focused, but the code is open and help is very welcome:

- 🐛 Bug fixes
- ✨ UX / accessibility polish on existing tools
- 🤖 Agent-prompt / output-quality improvements
- 📝 Docs
- 💡 **New-tool suggestions** — open an issue; if it fits, it may get built
- 🔧 Code toward a new or existing tool — coordinate via an issue first

One exception: `src/content/**` (blog posts, newsletter issues, product copy) is editorial work and doesn't take PRs. Spotted an error or have a topic idea? Open an issue instead.

By participating, you agree to the [Code of Conduct](https://www.timonwa.com/coc).

## Before you start

- **Questions or ideas / tool suggestions** → open an [issue](https://github.com/Timonwa/odd-jobs-by-timonwa/issues/new/choose).
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

**Prerequisites:** Node.js 22 (see [`.nvmrc`](./.nvmrc); `engines` enforces it), [pnpm](https://pnpm.io), and a [Google AI Studio key](https://aistudio.google.com/api-keys) if you're touching the AI tools.

Clone, install, and run: [README → Run locally](./README.md#run-locally). The [environment variables](./README.md#environment-variables) table lives there too — including which variables the AI tools actually need, and which one the app refuses to boot without in production.

Two things worth knowing before your first change:

- **Rate limiting is off on the dev server only.** Any build meters against Upstash if it can and refuses hosted AI if it can't, so a production-mode build without Upstash credentials will look broken until you read the boot log.
- **Drafts** go in `src/content/**/_drafts/` (gitignored) and are visible only under `pnpm dev`.

## Scripts

Every script, with what it does: [README → Scripts](./README.md#scripts). CI gates five of them, in order — `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm build` — and that is the set to run before pushing.

A `pre-commit` hook runs **lint-staged** (ESLint `--fix` + Prettier) on staged files via **husky**, so most formatting is automatic.

## Codebase layout

App Router with thin routes: every `page.tsx` holds only framework surface (metadata, static params, guards) and renders a `…PageContent` composed from section components. A tool's **UI** lives in `components/tools/<slug>/`; **server code** lives under the `lib/server/` boundary (no per-tool `lib/` folder). All components use **named exports** — file name, export name, and import name always match.

```text
src/app/
  layout.tsx                                   # root shell: fonts, theme script, SiteLayout
  manifest.ts  robots.ts  sitemap.ts           # SEO / PWA metadata routes
  icon.png  apple-icon.png  favicon.ico        # icons (Next metadata conventions)
  opengraph-image.tsx  twitter-image.tsx       # social share images
  error.tsx  not-found.tsx  global-error.tsx  loading.tsx
  (hub)/                                       # layout-bearing group — renders HubNavbar once
    page.tsx                                   #   landing
    tools/  categories/                        #   tools directory + category pages
    blog/  newsletter/  shop/                  #   thin entries; sections in components/<feature>/
  (tools)/<slug>/                              # grouping-only, no layout of its own;
                                               #   thin page.tsx + layout.tsx (metadata + JSON-LD)
src/mdx-components.tsx                         # MDX element mapping required by @next/mdx
src/styles/                                    # globals.css imports, in order: tokens, theme,
                                               #   base, components, utilities, animations
src/components/
  ui/          # app-agnostic reusables in 4 tiers (barrel: @/components/ui);
               #   one folder per component, index.tsx is the component
    base/      # atoms: Button, Input, Badge, ...
    blocks/    # composed: Card, Drawer, Section, ...
    patterns/  # page regions: Navbar, Footer, PageHero
    layouts/   # shells: SiteLayout, PageMain
  _shared/     # cross-feature: writer/ (the shared engine), category/, result/,
               #   source/, page/, byok/, content/, tool/, layout/ (navbar, footer,
               #   page shell, ThemeToggle)
  errors/      # framework boundaries: ErrorContent, NotFoundContent, GlobalErrorContent
  home/  categories/                           # hub page compositions
  tools/       # index.tsx = /tools directory; <slug>/ = each tool's UI
  blog/        # blog index sections + post/ + _shared/ (MDX widgets)
  newsletter/  # archive sections + issue/
  shop/        # listing sections + product/
src/lib/                                       # kind-first, flat inside each kind
  config/      # env, routes, site, tools, byok, ... (bare names; barrel omits server-only env)
  constants/   # <domain>.constant.ts — frozen values + their inferred types
  data/        # <domain>.data.ts — static page copy records
  hooks/       # use-<subject>.ts (+ writer/ concern group)
  schemas/     # <domain>.schema.ts — Zod schemas + their inferred meta types
  types/       # <domain>.type.ts — shapes with no const or schema behind them
  utils/       # <domain>.utils.ts + text/ svg/ storage/ writer/ groups (client-safe)
  server/      # server-only boundary (barrel exports services; marked server-only)
    actions/   # <domain>.action.ts — "use server" actions (AI tools + newsletter)
    services/  # <domain>.service.ts — content loaders + AI agents
    clients/   # <service>.client.ts (gemini), or <service>/ when a client needs more
               #   than a singleton — redis/ holds client, keys, ttl
    utils/     # ai/, rate-limit.utils.ts, og-image.utils.tsx, create-mdx-loader.utils.ts
```

Every `lib/` barrel lists one explicit export line per file. The single `export *` in the repo is `components/ui/index.ts`, which re-exports its four tier barrels; `lib/config/index.ts` omits `env.ts` because it is `server-only`.

## Anatomy of a tool

When building or extending a tool, reuse the shared layer rather than re-implementing plumbing:

1. **Route** — `src/app/(tools)/<slug>/page.tsx` (thin: import + render the content component) and `layout.tsx` (metadata + JSON-LD, both built from the tool's entry in `lib/data/tool-seo.data.ts`).
2. **UI** — `components/tools/<slug>/`: section components + an `index.tsx` composer, all **tool-prefixed** (`FooBarHero`, `FooBarTool`) and **named-exported**. Use primitives from `@/components/ui`. State hooks, constants, and types live in `lib/` (`hooks/`, `constants/`, `types/`), not the component folder.
3. **Server** _(AI tools only — client-only tools like the counters and converters stop at step 2)_ — `lib/server/actions/<domain>.action.ts` (a `"use server"` action) + `lib/server/services/<domain>.service.ts` (the agent). The domain is the short name (`seo-meta`), not the route slug. Reuse from `@/lib/server/utils/ai`, `@/lib/server/clients`, and `@/lib/utils` (client-safe):
   - **`parseActionInput` — required.** Every action's first statement: parses a bounded Zod schema from `lib/schemas/` and throws a coded `INVALID_INPUT` the UI handles. Declare the schema there, not inline in the action
   - `assertSafeArticleUrl` — the SSRF guard on any user-supplied URL
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

Each tool's agent lives under `lib/server/services/<domain>.service.ts` (`seo-meta`, `social-posts`). Prompt tweaks are welcome, but please:

- Include a **before/after example** in the PR — same input, old prompt vs. yours.
- Note any token-count impact (longer inputs = more cost per run).
- Test every input mode the tool supports (e.g. URL _and_ pasted text).

## Workflow

1. **Fork** and branch from `dev`, the integration branch: `git checkout -b fix/what-you-are-fixing`. Branch names are `type/short-kebab-description` (`feat/…`, `fix/…`, `docs/…`).
2. **Make your change**, keeping the diff tight. Prefer editing existing files over creating new ones.
3. **Verify locally:**

   ```bash
   pnpm lint
   pnpm format:check
   pnpm typecheck
   pnpm build
   ```

   These four are exactly what CI gates, in the same order — nothing else is checked, and nothing here is optional.

4. **Commit.** [Conventional Commits](https://www.conventionalcommits.org/) preferred — pick a type (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`) with a clear subject.
5. **Push and open a PR** against `dev` (not `main` — `main` tracks what's deployed). Fill out the PR template (what/why, how to test).

## Reporting security issues

Don't open a public issue for security bugs — use [GitHub's private security advisories](https://github.com/Timonwa/odd-jobs-by-timonwa/security/advisories/new). See [SECURITY.md](./SECURITY.md).

## License

This project splits licensing between **code** and **content**:

- **Code** — everything except `src/content/**` — is [AGPL-3.0](./LICENSE). By contributing code, you agree your work is released under it.
- **Content** — `src/content/**` (blog posts, newsletter issues, product copy) and the brand — is **not** open source (see [LICENSE-content](./LICENSE-content) and [TRADEMARK.md](./TRADEMARK.md)). It's the maintainer's editorial/personal material, so **content PRs aren't accepted**; typo fixes are fine via an issue.

Contribute to the tools and the code — that's what's open.
