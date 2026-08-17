# Dependency audit — the-productivity-bug (single Next.js 16 app, pnpm)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `feat/the-productivity-bug` · **Scope:** root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.github/workflows` + `.github/actions/setup`, and the source tree (`src/`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`) · **Overall:** 7/10

**Not a monorepo.** `pnpm-workspace.yaml` declares no `packages:` list — only `allowBuilds` and one `overrides` entry — so the **workspace-protocol** and **pnpm catalog** checks do not apply and were **skipped** (nothing to be consistent across; there is exactly one importer, `.`). Version-consistency was therefore judged within the single manifest (coupled pairs, plugin-matches-host, range style) rather than across members.

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | N/A      | 7/10    | N/A | N/A   |

First run — no prior `_reports/dependency-audit.md`, so every finding is `NEW` and there is no "Resolved since last audit" section.

## Findings

| ID  | Severity | Category                    | Status | Issue                                                                                                             | Location                                                   |
| --- | -------- | --------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1   | HIGH     | Vulnerabilities             | NEW    | `next` pinned to 16.2.10 — 8 open advisories (4 high, 4 moderate), all patched in 16.2.11; ≥3 reachable here      | `package.json:37`                                          |
| 2   | HIGH     | Vulnerabilities / overrides | NEW    | The `postcss: ">=8.5.10"` override is still needed but its floor is stale — lockfile resolved a vulnerable 8.5.17 | `pnpm-workspace.yaml:8-11`, `pnpm-lock.yaml:2255`          |
| 3   | MEDIUM   | Vulnerabilities             | NEW    | `dompurify` 3.4.12 (patched 3.4.13) is the sanitizer on the app's only `dangerouslySetInnerHTML` path             | `src/components/tools/svg-to-jsx/SvgToJsxTool.tsx:140-148` |
| 4   | MEDIUM   | Vulnerabilities             | NEW    | `sharp` 0.34.5 via Next's optional dep inherits 4 libvips CVEs; patched ≥0.35.0                                   | `pnpm-lock.yaml:2408`                                      |
| 5   | MEDIUM   | Unmaintained / transitive   | NEW    | `gray-matter` (unmaintained since 2023) pins vulnerable `js-yaml` 3.15.0 into the production graph                | `package.json:20`, `pnpm-lock.yaml:1765`                   |
| 6   | LOW      | Version consistency         | NEW    | Next-family ranges disagree in style: `next`/`eslint-config-next` exact, `@next/mdx` caret                        | `package.json:8,37,53`                                     |
| 7   | LOW      | Misplaced / unused deps     | NEW    | `@types/mdx` + `@mdx-js/loader` are build/type-only but sit in `dependencies`; `@mdx-js/react` is unused          | `package.json:3-6`                                         |
| 8   | LOW      | Supply chain / lifecycle    | NEW    | `allowBuilds` pre-approves 4 packages absent from the tree                                                        | `pnpm-workspace.yaml:1-7`                                  |
| 9   | LOW      | Supply chain / provenance   | NEW    | 5 direct deps ship without npm provenance attestations                                                            | `package.json` (dependencies)                              |
| 10  | LOW      | Maintenance drift           | NEW    | `sugar-high` a major behind (1.2.1 → 2.0.1); `ai` 39 patches behind; `lucide-react` 7 minors behind               | `package.json:12,18,24`                                    |

### F1 — `next` 16.2.10 carries 8 open advisories; at least 3 are reachable in this app

- **What:** `package.json:37` pins `"next": "16.2.10"` and `pnpm-lock.yaml:2141` resolves exactly that. `pnpm audit` reports 8 advisories against `next >=16.0.0 <16.2.11` — 4 high, 4 moderate — all fixed by 16.2.11; the current release is 16.3.1 (a **minor**, not a major). I checked each against the code rather than taking the count at face value:
  - **Reachable — Server Action DoS (GHSA-m99w-x7hq-7vfj, high):** the app ships three `"use server"` modules (`src/lib/server/actions/newsletter.action.ts`, `seo-meta.action.ts`, `social-posts.action.ts`), publicly invocable from the tool pages.
  - **Reachable — unauthenticated disclosure of internal Server Function endpoints (GHSA-955p-x3mx-jcvp, moderate):** same Server Action surface.
  - **Likely reachable, needs confirmation — cache confusion for requests with bodies (GHSA-4633-3j49-mh5q / GHSA-68g3-v927-f742, moderate):** `next.config.ts:5` enables `cacheComponents: true` and the tool pages POST via Server Actions; I could not prove a cross-user body mix-up from source alone.
  - **Not applicable — middleware/proxy bypass (GHSA-6gpp-xcg3-4w24, high):** there is no `middleware.ts` anywhere in the repo and no i18n config.
  - **Not applicable — SSRF in Server Actions on custom servers (GHSA-89xv-2m56-2m9x, high):** no custom server (`server.js`) exists; the app runs on the stock Next server.
  - **Not applicable — SSRF in rewrites (GHSA-p9j2-gv94-2wf4, high):** `next.config.ts` declares only two static `redirects()` (`/guides` → `/blog`) and no `rewrites()`.
  - **Not applicable — Image Optimization SVG DoS (GHSA-q8wf-6r8g-63ch, moderate):** no `images` config at all, so `dangerouslyAllowSVG` is off.
  - **Not applicable — unbounded Server Action payload in Edge runtime (GHSA-68g3-v927-f742 variant, moderate):** `runtime = "edge"` appears only on OG/Twitter image routes; the Server Actions run on Node.
- **Why it matters:** on a live site the DoS path lets an unauthenticated caller exhaust the Server Action worker with a crafted request, and the endpoint-disclosure issue leaks internal Server Function IDs that make the other Server Action bugs easier to target. Reconciling GitHub's raw alert count: Dependabot lists each `next` advisory **twice** (once for `package.json`, once for `pnpm-lock.yaml`), which is why 8 distinct advisories show as 16 alerts.
- **Fix:** bump `next` to 16.3.1 and move the coupled packages in the same commit — `eslint-config-next` (currently exact `16.2.10`) and `@next/mdx` (`^16.2.10`) are published in lockstep with Next. Non-major, so the risk is a normal minor upgrade; verify with `pnpm exec tsc --noEmit && pnpm lint && pnpm build`.

### F2 — the `postcss` override is still necessary but its floor no longer patches anything

- **What:** `pnpm-workspace.yaml:8-11` forces `postcss: ">=8.5.10"` with a comment citing GHSA-qx2v-qp2m-jg93. The override's _premise_ still holds — `node_modules/next/package.json` pins `postcss: "8.4.31"` **exactly**, and `@tailwindcss/postcss` brings its own copy, so without the override the tree would contain 8.4.31. But the floor is now below the current patch level: `pnpm-lock.yaml:2255` resolved **postcss 8.5.17**, which is still vulnerable to GHSA-r28c-9q8g-f849 (**high** — path traversal via previous-source-map auto-loading, patched 8.5.18) and GHSA-fxqj-rqcc-2cmp (moderate, `<=8.5.22`, patched 8.5.23). The same stale range keeps `nanoid` at 3.3.15 (`pnpm-lock.yaml:2128`), which carries two **high** advisories (GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8; patched 3.3.18) — `nanoid` reaches the tree only through `postcss`, so a postcss bump clears it too.
- **Why it matters:** a `>=` floor was written as a security control, but because the lockfile freezes resolution, the control silently stopped delivering the patched version — three high advisories persist in a tree the repo believes is protected. Practical reachability is **build-time only**: postcss processes repo-authored CSS (`src/styles/*.css`) during `pnpm build`, not attacker-supplied input, so this is a CI/developer-machine exposure rather than a runtime one — but the fix is a one-line, zero-risk change.
- **Fix:** raise the override floor to `postcss: ">=8.5.23"` in `pnpm-workspace.yaml` and re-resolve so the lockfile picks up 8.5.23+ and `nanoid` 3.3.18+. Keep the comment, and add the current advisory IDs so the next reader knows which floor the number encodes.

### F3 — `dompurify` 3.4.12 guards the app's only HTML-injection path

- **What:** `src/components/tools/svg-to-jsx/SvgToJsxTool.tsx:145` sanitizes user-pasted SVG with `DOMPurify.sanitize(trimmed, { USE_PROFILES: { svg: true, svgFilters: true } })` before it is injected via `dangerouslySetInnerHTML`. The installed version is 3.4.12 (`pnpm-lock.yaml:1180`), matched by GHSA-55q2-fjhq-7xh7 (moderate, `<=3.4.12`, patched 3.4.13).
- **Why it matters:** the advisory itself is **not reachable here** — it requires `IN_PLACE: true` plus hook removal, and this is the only DOMPurify call site in the repo: no `IN_PLACE`, no `addHook`/`removeHook`/`removeAllHooks` anywhere. So this is not an exploitable XSS today. It is still worth fixing first among the "not reachable" items because DOMPurify is the single control standing between pasted markup and the DOM, and the fix is a patch bump inside the existing `^3.4.12` range.
- **Fix:** `pnpm update dompurify` (resolves 3.4.13, no manifest edit needed since `^3.4.12` already allows it).

### F4 — `sharp` 0.34.5 inherits four libvips CVEs

- **What:** `pnpm-lock.yaml:2408` resolves `sharp@0.34.5`, pulled in as Next's optional dependency (`sharp: "^0.34.5"` in `node_modules/next/package.json`). GHSA-f88m-g3jw-g9cj (**high**) covers `<0.35.0` for CVE-2026-33327/33328/35590/35591 in the bundled libvips.
- **Why it matters:** severity is high in the advisory, but exposure here is narrow — `next.config.ts` sets no `images` block, so there are no `remotePatterns` and `/_next/image` will only optimize assets that ship with the repo (`next/image` is used in `src/components/blog/_shared/PostFigure.tsx`). No caller can feed attacker-chosen image bytes to libvips, which is what these CVEs need. Also note `sharp` is one of only two packages in the tree with an install script, so it does execute code at install time (allow-listed — see F8).
- **Fix:** first re-check after the F1 upgrade whether Next 16.3.1 raises its `sharp` range (needs confirmation — it may still be `^0.34.5`). If it doesn't, add `sharp: ">=0.35.0"` to `pnpm.overrides` after confirming Next's image pipeline works against 0.35 (prebuilt binaries change between sharp minors, so build and load an optimized image before committing).

### F5 — `gray-matter` is unmaintained and pins a vulnerable `js-yaml` 3.x into the production graph

- **What:** `gray-matter@4.0.3` depends on `js-yaml: "^3.13.1"`, and `pnpm-lock.yaml:1765` resolves `js-yaml@3.15.0` — matched by GHSA-5p4m-2wfm-xmqj (**high**, quadratic CPU in `!!omap` resolution, patched 3.15.1) in **runtime** scope. `gray-matter` itself has been static since 2023 (`time.modified 2023-07-12`, latest still 4.0.3) and publishes without provenance. The second `js-yaml` hit (4.3.0, patched 4.3.1) is dev-scope only, via `eslint`/`@eslint/eslintrc`.
- **Why it matters:** the runtime-scope label overstates the real exposure — `gray-matter` is used in exactly one place, `src/lib/server/utils/create-mdx-loader.utils.ts`, to read frontmatter out of repo-authored MDX under `src/content/`. No request data ever reaches the YAML parser, so the quadratic-CPU bug is not triggerable by a visitor. What does matter is the structural risk: an unmaintained parser is now the reason a high advisory sits in the tree with no upstream fix coming.
- **Fix:** short term, add `js-yaml: ">=3.15.1"` to `pnpm.overrides` (it satisfies gray-matter's `^3.13.1`, so nothing breaks). Longer term, since only frontmatter parsing is needed, consider dropping `gray-matter` for a maintained parser (`vfile-matter`, or `js-yaml` 4.x called directly) — this is a small, contained swap in one util.

### F6 — Next-family ranges disagree in style, letting `@next/mdx` drift off `next`

- **What:** `package.json` pins `"next": "16.2.10"` and `"eslint-config-next": "16.2.10"` exactly, but `"@next/mdx": "^16.2.10"` with a caret. `@next/mdx` is not a standalone library: `node_modules/@next/mdx/index.js` wires itself into Next internals (`private-next-root-dir/src/mdx-components`, the `@vercel/turbopack-next/mdx-import-source` alias, `options.defaultLoaders.babel`). Today the lockfile has all three at 16.2.10, so nothing is broken — the defect is the range, which permits `@next/mdx` 16.3.x on a fresh resolve while `next` stays pinned at 16.2.10.
- **Why it matters:** a mismatched MDX plugin against a pinned Next fails at build time in the Turbopack/webpack wiring, and the failure surfaces on whoever re-resolves the lockfile rather than on whoever introduced it.
- **Fix:** pin `@next/mdx` exactly like its siblings (`"@next/mdx": "16.3.1"` alongside the F1 bump), and treat `next` / `eslint-config-next` / `@next/mdx` as one unit in future upgrades.

### F7 — build/type-only MDX packages sit in `dependencies`, and one is unused

- **What:** verified by scanning every tracked source file for imports of each declared dep:
  - `@types/mdx` (`dependencies`) is genuinely used — `src/mdx-components.tsx:1` imports `MDXComponents` from `mdx/types` — but it is a types-only package and belongs in `devDependencies`.
  - `@mdx-js/loader` (`dependencies`) is never imported by app code; it is loaded by `@next/mdx` at build time (`node_modules/@next/mdx/mdx-js-loader.js` does `require('@mdx-js/loader')`, the default path since `experimental.mdxRs` is unset). Build-time → `devDependencies`.
  - `@mdx-js/react` (`dependencies`) has **zero** references in the repo, and I traced why it isn't needed: `@next/mdx/index.js:32-37` lists `'@mdx-js/react'` only as the third fallback in the `next-mdx-import-source-file` webpack alias, after `private-next-root-dir/src/mdx-components` — which this repo provides (`src/mdx-components.tsx`) — and the Turbopack path resolves to `@vercel/turbopack-next/mdx-import-source` instead. It is an **optional** peer of `@next/mdx` (`peerDependenciesMeta.@mdx-js/react.optional === true`), so dropping it is safe.
  - Everything else declared is accounted for: `babel-plugin-react-compiler` is a declared peer of `next` and required by `reactCompiler: true`; `tw-animate-css` and `tailwindcss` enter via `src/styles/globals.css:1-2`; `remark-frontmatter`/`remark-gfm` via `next.config.ts`; the rest are imported directly. **No missing/phantom dependencies** — the only undeclared import specifiers are the `@env` tsconfig path alias (`tsconfig.json:23`) and `mdx/types`.
- **Why it matters:** packages in `dependencies` are installed in production and audited as runtime scope, which inflates both the deploy install and the advisory triage surface; an unused package is pure supply-chain area for no benefit.
- **Fix:** move `@types/mdx` and `@mdx-js/loader` to `devDependencies`; remove `@mdx-js/react` and confirm with `pnpm build` (the MDX pages must still render).

### F8 — `allowBuilds` pre-approves four packages that aren't in the tree

- **What:** `pnpm-workspace.yaml:1-7` allow-lists install scripts for `@google/genai`, `cpu-features`, `protobufjs`, `sharp`, `ssh2`, `unrs-resolver`. I enumerated every `package.json` under `node_modules/.pnpm` for `preinstall`/`install`/`postinstall` scripts: exactly **two** packages have any — `sharp@0.34.5` (`install`) and `unrs-resolver@1.12.2` (`postinstall`). The other four are not present in the dependency graph at all (`@google/genai` in particular is a leftover from before the AI SDK path via `@ai-sdk/google`).
- **Why it matters:** the overall posture here is good — pnpm 11 blocks dependency lifecycle scripts by default and this repo allow-lists rather than disabling the block, which is exactly right. The residue is the problem: install scripts are the primary npm-malware vector, and a stale allow-list means that if any of those four is ever pulled back in transitively, its arbitrary install-time code runs with no review.
- **Fix:** trim `allowBuilds` to `sharp` and `unrs-resolver`, and re-add entries only when an install actually blocks on them.

### F9 — five direct dependencies ship without provenance attestations

- **What:** queried each direct dep at its installed version for `dist.attestations.provenance`. Attested: `next`, `react`, `ai`, `@ai-sdk/google`, `zod`, `@upstash/redis`, `lucide-react`, `tailwind-merge`, `tw-animate-css`. **Not** attested: `dompurify`, `gray-matter`, `sugar-high`, `react-simple-code-editor`, `clsx`.
- **Why it matters:** defense-in-depth only — all five are long-established packages and nothing here suggests compromise. But without provenance there is no cryptographic link from the tarball back to a build in a known repo, so a maintainer-account compromise is harder to detect. Two of the five (`dompurify` on the sanitization path, `gray-matter` at build time) are also the ones already flagged above.
- **Fix:** no action required now; treat provenance as a selection criterion for anything newly added, and keep these five on the short list to re-evaluate if a maintained attested alternative appears.

### F10 — maintenance drift on three runtime packages

- **What:** from `pnpm outdated`: `sugar-high` 1.2.1 → **2.0.1** (a full major behind; the caret range can never reach it), `ai` 7.0.27 → 7.0.66 (39 patch releases), `lucide-react` 1.24.0 → 1.31.0, plus `@ai-sdk/google` 4.0.15 → 4.0.44. Dev-side drift is larger but lower stakes (`eslint` 9 → 10, `typescript` 5.9 → 7.0 — both majors, deliberate holds).
- **Why it matters:** no advisory attaches to any of these, so this is hygiene. The `ai` / `@ai-sdk/google` gap is the one to close soonest: those releases are where provider and streaming fixes land, and the app's three Server Actions all run through `src/lib/server/utils/ai/generate-from-article.utils.ts`.
- **Fix:** run the in-range updates (`ai`, `@ai-sdk/google`, `lucide-react`, plus patch-level `react`/`react-dom` 19.2.8) as one routine bump; handle `sugar-high` 2.x separately since a major may change its token class names, which `src/styles/tokens.css` styles.

## Scorecard

| Category                       | Score | Notes                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version consistency            | 8/10  | `react`/`react-dom` both exact 19.2.7; `@types/react` 19 matches `react` 19; `zod` 4.4.3 satisfies both `ai` and `@ai-sdk/google` peers. Only `@next/mdx`'s caret drifts from its exact-pinned Next siblings (F6).                                                                                                                                                     |
| Workspace protocol             | N/A   | Skipped — single-package repo, no `packages:` list and no internal `@app/*` packages, so there is nothing for `workspace:*` to reference.                                                                                                                                                                                                                              |
| pnpm catalog                   | N/A   | Skipped — a catalog exists to pin shared deps across members; with one importer it would add indirection and no guarantee.                                                                                                                                                                                                                                             |
| Unused deps                    | 7/10  | One genuinely unused package (`@mdx-js/react`) and two misplaced into `dependencies` (F7); everything else traced to a real import, CSS `@import`, config reference, or declared peer.                                                                                                                                                                                 |
| Missing / phantom deps         | 10/10 | Every external import specifier in tracked sources resolves to a declared dep — no reliance on hoisting.                                                                                                                                                                                                                                                               |
| Duplicates                     | 9/10  | 22 duplicated names out of 603, all dev-tooling transitives (`brace-expansion`, `js-yaml`, `minimatch`, ansi/string helpers). Singleton-sensitive packages are single-copy: one `react`, one `react-dom`, one `next`, one `zod`. No overlapping libraries (one icon set, one sanitizer, one class-merge pair).                                                         |
| Removed-package regressions    | 10/10 | Lockfile has no `axios`/`node-fetch`/`request`/`swr`/`@tanstack/react-query`/`next-sitemap`/`moment`/`lodash`/`react-icons` — nothing deliberately dropped has crept back.                                                                                                                                                                                             |
| Deprecated / unmaintained      | 7/10  | Zero packages in the tree carry a `deprecated` field, but `gray-matter` is de facto unmaintained and is the source of a high advisory (F5).                                                                                                                                                                                                                            |
| Vulnerabilities & supply chain | 5/10  | 21 advisories (14 high / 7 moderate) across `next`, `postcss`, `nanoid`, `sharp`, `js-yaml`, `dompurify`, `brace-expansion`. Every reachable one is fixed by non-major bumps. Lifecycle-script posture is strong (only 2 script-bearing packages, both allow-listed under pnpm's default block); 5 direct deps lack provenance.                                        |
| Lockfile                       | 10/10 | One `pnpm-lock.yaml` (v9.0) at root, no stray `package-lock.json`/`yarn.lock`, clean in `git status`. All 35 manifest entries match the lockfile's `.` importer specifiers exactly — no drift, no extras, none missing. `packageManager` pins `pnpm@11.1.1` with a hash, and CI installs via `pnpm install --frozen-lockfile` (`.github/actions/setup/action.yml:30`). |

**Reconciling GitHub's 25 Dependabot alerts:** the open alerts I could enumerate are 24 (14 high / 10 moderate), and they collapse to **13 distinct advisories** — every `next` and `js-yaml` advisory is listed twice because Dependabot counts `package.json` and `pnpm-lock.yaml` as separate manifests. Of those 13, three are reachable in this app's code paths (all `next`, see F1), one more needs confirmation (`next` cache confusion), and the rest are either build-time-only (`postcss`, `nanoid`), gated behind input this app never accepts (`sharp` with no `remotePatterns`, `js-yaml` on repo-authored frontmatter), or require an API the code doesn't use (`dompurify` `IN_PLACE` + hooks). Separately, `pnpm audit` surfaces four **dev-only** `brace-expansion` advisories via `eslint`/`eslint-config-next` that Dependabot does not list — dev-scope tooling DoS, no production exposure, and no finding is raised for them.

## Action items

### Fix Now

| #   | Priority | Task (finding ID)                                                                                                                | Effort |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Upgrade `next` 16.2.10 → 16.3.1 with `eslint-config-next` and `@next/mdx` in the same commit; verify tsc + lint + build (F1, F6) | S      |
| 2   | P0       | Raise the override floor to `postcss: ">=8.5.23"` and re-resolve so `postcss` ≥8.5.23 and `nanoid` ≥3.3.18 land in the lock (F2) | XS     |

### Next Release

| #   | Priority | Task (finding ID)                                                                                                            | Effort |
| --- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------ |
| 3   | P1       | `pnpm update dompurify` to 3.4.13 (in-range patch on the sanitization path) (F3)                                             | XS     |
| 4   | P1       | Add `js-yaml: ">=3.15.1"` to `pnpm.overrides` to patch the `gray-matter` path (F5)                                           | XS     |
| 5   | P1       | After the Next bump, re-check `sharp`'s resolved version; add a `>=0.35.0` override only if Next still ranges `^0.34.5` (F4) | S      |
| 6   | P2       | Move `@types/mdx` + `@mdx-js/loader` to `devDependencies`; drop the unused `@mdx-js/react`; confirm with `pnpm build` (F7)   | XS     |
| 7   | P2       | Trim `allowBuilds` to `sharp` + `unrs-resolver` (F8)                                                                         | XS     |

### Backlog

| #   | Priority | Task (finding ID)                                                                                                       | Effort |
| --- | -------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| 8   | P3       | Routine in-range bump of `ai`, `@ai-sdk/google`, `lucide-react`, `react`/`react-dom` patches (F10)                      | S      |
| 9   | P3       | Evaluate `sugar-high` 2.x separately — check token class names against `src/styles/tokens.css` before upgrading (F10)   | S      |
| 10  | P3       | Consider replacing `gray-matter` with a maintained frontmatter parser in `create-mdx-loader.utils.ts` (F5)              | M      |
| 11  | P3       | Prefer provenance-attested packages for new additions; re-evaluate the five unattested deps if alternatives appear (F9) | XS     |
