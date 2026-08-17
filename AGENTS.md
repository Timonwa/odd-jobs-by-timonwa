<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

Operational rules for AI agents working in this repo. Keep the block above intact — it's auto-managed. For the full tool anatomy and dev setup, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## What this is

A hub of small, single-purpose web tools (Next.js 16 App Router, React 19, TypeScript, Tailwind v4). Two kinds of tool:

- **AI tools** (e.g. Article to SEO Meta, Article to Social Posts) — a `"use server"` action calls Gemini via the Vercel AI SDK. Server code lives under the **`lib/server/` boundary**: the action in `lib/server/actions/<slug>.action.ts`, the agent in `lib/server/services/<name>.service.ts`.
- **Client-only tools** (e.g. Word Counter, Case Converter, Slug Generator, Reading Time) — run entirely in the browser: no server action.

`TOOLS` in `lib/config/tools.ts` is the single registry — one entry wires a tool into the home grid, navbar, and sitemap.

## Structure

- **`lib/` is strictly kind-first, flat inside each kind** — client-safe kinds at the root: `config/ constants/ data/ hooks/ schemas/ types/ utils/`. The domain is a filename prefix, not a subfolder: `constants/<domain>.constant.ts`, `types/<domain>.type.ts`, `schemas/<domain>.schema.ts`, `data/<domain>.data.ts`, `utils/<domain>.utils.ts` (a single-function file whose name is the function may stay bare: `cn.ts`, `is-browser.ts`). A domain that outgrows one file becomes a folder whose files carry only the concern (`utils/text/case.ts`, `utils/storage/`). Each kind has a barrel with **one explicit export line per file** (never `export *`); import as `@/lib/<kind>`.
- **Server-only code lives under `lib/server/`** — the one sanctioned non-kind root folder, itself kind-first: `actions/<domain>.action.ts` (Server Actions; barrel importable from client components), `services/<domain>.service.ts` (content loaders + AI agents), `clients/<service>.client.ts` (configured SDK singletons, e.g. `gemini.client.ts`), `utils/` (`ai/`, `rate-limit.utils.ts`, `og-image.utils.tsx`, `create-mdx-loader.ts`). The top `@/lib/server` barrel is marked `server-only` and exports **services only**; never pull anything under `server/` into a client bundle.
- **`schemas/` owns Zod schemas and their inferred types together** (`post.schema.ts` → `PostMetaType`) — never re-declare an inferred type in `types/`.
- **`components/`** — `ui/` in **4 tiers** (`base/` atoms, `blocks/` composed, `patterns/` page regions, `layouts/` shells — one folder per component, tier barrels, root barrel `@/components/ui`); `_shared/` (cross-feature: the `writer/` engine, `category/`, `result/`, `source/`, `page/`, `byok/`, `content/`, `tool/`); `layout/`; feature folders mirroring the route tree — `home/`, `categories/`, `tools/<slug>/`, `blog/` (+`post/`, `_shared/` MDX widgets), `newsletter/` (+`issue/`), `shop/` (+`product/`). Components hold `.tsx` only — hooks/constants/types live in `lib/`. **Named exports everywhere** — file name, export name, and import name always match.
- **Thin route entries.** `app/**/page.tsx` holds only framework surface (metadata, `generateStaticParams`, guards) and renders a named `…PageContent` composed in `components/<feature>/<page>/index.tsx` from one-file-per-section components.

## Verify before you claim done

Run all three; never report success on an unverified change:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Prettier and the pre-commit hook handle formatting.

## Conventions that matter

- **Naming — no aliases, descriptive, no duplicates.** A module's file name, exported name, and usage must match; never rename on import (`import X as Y`). Names are descriptive over terse (`createGeminiClient`, not `getGemini`). Feature-local components are **feature/tool-prefixed** (`SeoMetaHero`, `HomeHero`) — no bare duplicate `Hero` across features. Types are **clean PascalCase with no `Type` suffix** (`ArticleSource`, `PostMeta`); the only suffixes are `Props` for component props and `Schema` for Zod schema values (`SeoMetaSchema` → inferred `SeoMetaOutput`). Functions are verb-first (`get` sync/local, `fetch` async/remote); booleans read as assertions (`is…`/`has…`/`can…`).
- **Namespaced keys + events.** Every localStorage/sessionStorage key and custom DOM event name is built via `namespaced()` as `tbt:<area>:<name>` — storage keys in `constants/storage-keys.ts`, event names in `constants/events.ts`. Never inline a raw key/event string.
- **Comments only when non-obvious.** If deleting a comment wouldn't confuse a future reader, don't write it. Don't narrate what the code plainly does.
- **Semantic HTML + accessibility.** Real elements (`<dl>`, headings, lists, `<button>`), not div-soup. A jsx-a11y ruleset gates CI — keep labels, focus order, and keyboard paths intact.
- **Specific, self-contained copy.** Name the subject; avoid vague headings and deixis ("the box", "here"). UI text should stand alone.
- **No scope creep.** Do the task in front of you. Refactors, renames, and unrelated cleanups go in their own change.
- **Reuse the shared layer.** Before adding plumbing, check `lib/server/` (`createGeminiClient` in `clients/`, plus `resolvePlatformApiKey`, `enforceDailyQuota`, `generateSchemaOutputFromArticle`, `resolveArticleSource`, `toUserMessage` in `utils/ai/`), `lib/utils/` (client-safe: `isBrowser`, `articleSourceIdentity`, the `createLocalStore`/`createHistoryStore`/`createWriterStorage` factories in `storage/`), and `components/_shared/` (incl. the `writer/` engine — `Writer`, `useWriter`, `WriterRuntimeType` — and `JsonLdScript`).

## Git — ask first

- **Never commit, push, or open a PR unless the user explicitly asks.** Staging to show a diff is fine; committing is not.
- **Never commit to `main`** — branch first (`fix/…`, `feat/…`, `docs/…`).
- **Stage only files you changed this session.** Don't sweep in pre-existing modifications — the pre-commit hook re-stages, so check `git status` before committing.
- Conventional Commits (`type(scope): subject`); keep every line ≤100 chars.

## Environment

- `APP_ENV` gates production-only integrations (rate limiting) — set it explicitly on deploy; unset = `development`.
- BYOK Gemini keys live in the browser's `sessionStorage`, never on a server. Tool input is request-scoped, not logged or cached (URL fetches use a 1-hour in-memory cache).
- `pnpm-workspace.yaml` pins `postcss >=8.5.10` to patch a vulnerability Next still transitively pins. Re-check on Next upgrades.
