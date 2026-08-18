# Dependency audit — the-productivity-bug (single Next.js 16 app, pnpm)

**Date:** 2026-08-17 (fix pass applied same day) · **Phase:** production · **Mode:** fixes applied · **Branch:** `code-restructuring` · **Scope:** root `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.github/workflows` + `.github/actions/setup`, and the source tree · **Overall:** 9.5/10

**Not a monorepo.** `pnpm-workspace.yaml` declares no `packages:` list — only `allowBuilds` and `overrides` — so the **workspace-protocol** and **pnpm catalog** checks do not apply and were **skipped** (exactly one importer, `.`). Version consistency was judged within the single manifest.

**`pnpm audit` now reports no known vulnerabilities** (was 21 advisories: 14 high / 7 moderate). `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` all pass.

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | 7/10     | 9/10    | +2  | ▲     |

The remaining 1 point is two deliberate choices and one structural item, not open defects: five deps without provenance (F9, no action by design), version drift held back by project policy (F10), and `gray-matter` still being unmaintained (backlog).

## Findings

| ID  | Severity | Category                    | Status       | Issue                                                                                    | Resolution                                                        |
| --- | -------- | --------------------------- | ------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | HIGH     | Vulnerabilities             | **FIXED**    | `next` 16.2.10 — 8 advisories, ≥3 reachable                                              | → 16.2.11 with `eslint-config-next` + `@next/mdx` in lockstep     |
| 2   | HIGH     | Vulnerabilities / overrides | **FIXED**    | `postcss` override floor stale; resolved a vulnerable 8.5.17 and dragged `nanoid` 3.3.15 | Floor → `>=8.5.23`; resolved postcss 8.5.26, nanoid 3.3.18        |
| 3   | MEDIUM   | Vulnerabilities             | **FIXED**    | `dompurify` 3.4.12 on the only `dangerouslySetInnerHTML` path                            | Range → `^3.4.13`; resolved 3.4.13                                |
| 4   | MEDIUM   | Vulnerabilities             | **FIXED**    | `sharp` 0.34.5 inherits 4 libvips CVEs                                                   | New override `>=0.35.0`; resolved 0.35.3                          |
| 5   | MEDIUM   | Unmaintained / transitive   | **FIXED**    | `gray-matter` pins vulnerable `js-yaml` 3.15.0                                           | Override `>=3.15.1 <4`; resolved 3.15.1 (ceiling is load-bearing) |
| 6   | LOW      | Version consistency         | **FIXED**    | `@next/mdx` caret let it drift off exact-pinned Next                                     | Pinned exactly, same version as its siblings                      |
| 7   | LOW      | Misplaced / unused deps     | **FIXED**    | `@types/mdx` + `@mdx-js/loader` in `dependencies`; `@mdx-js/react` unused                | Both moved to `devDependencies`; `@mdx-js/react` removed          |
| 8   | LOW      | Supply chain / lifecycle    | **FIXED**    | `allowBuilds` pre-approved 4 packages absent from the tree                               | Trimmed to `sharp` + `unrs-resolver`, with the rule commented     |
| 9   | LOW      | Supply chain / provenance   | **ACCEPTED** | 5 direct deps ship without provenance attestations                                       | No action available; treat provenance as a selection criterion    |
| 10  | LOW      | Maintenance drift           | **PARTIAL**  | `sugar-high` a major behind; `ai` 39 patches; `lucide-react` 7 minors                    | Project policy: bump for security or a deliberate major only      |

### F1 — FIXED: `next` 16.2.10 → 16.2.11

`next`, `eslint-config-next`, and `@next/mdx` all moved to `16.2.11` in one change, closing all 8 advisories including the three reachable here (Server Action DoS, internal Server Function endpoint disclosure, and the cache-confusion case that needed confirmation).

**Deviation from the original recommendation, deliberately:** the report proposed 16.3.1 (latest minor). Project policy is to bump for a vulnerability or a considered major, not for version currency — 16.2.11 is the patch that fixes every advisory, so that is what shipped. `pnpm install` notes 16.3.1 is available; that is expected and not drift.

### F2 — FIXED: postcss floor raised, `nanoid` lifted with it

Override is now `postcss: ">=8.5.23"`; the lockfile resolves **8.5.26**, and `nanoid` — which reaches the tree only through postcss — resolves **3.3.18**, clearing its two high advisories. The override's premise still holds: `next@16.2.11` pins `postcss: 8.4.31` exactly, verified against the registry.

The comment in `pnpm-workspace.yaml` now lists every advisory the floor encodes, so the next reader knows which number to raise and why. That was the actual defect here — a `>=` floor written once as a security control and never revisited silently stops delivering patches.

### F3 — FIXED: `dompurify` 3.4.13

The floor went into the manifest range (`^3.4.13`), not just the lockfile, so a fresh resolve can never land back on 3.4.12. Still the only DOMPurify call site (`SvgToJsxTool`), still without `IN_PLACE` or hooks, so this was never exploitable here — fixed because it guards the app's one HTML-injection path.

### F4 — FIXED: `sharp` 0.35.3 via override

Confirmed against the registry that `next@16.2.11` still ranges `sharp: ^0.34.5`, so the override was necessary rather than redundant. Resolved **0.35.3**; `pnpm build` passes and the optimized-image path (`PostFigure` via `/_next/image`) still renders, which was the risk the original finding flagged about sharp's prebuilt binaries changing between minors.

### F5 — FIXED: `js-yaml` 3.15.1, with a required `<4` ceiling

Override is `js-yaml: ">=3.15.1 <4"`, resolving **3.15.1**.

Two corrections to the original finding, both established by testing rather than reading:

- **The report's premise was wrong in the audit output's title** ("CVE-2026-59870 fix not backported"). A patched 3.x does exist — `3.15.1`, published under the `v3-legacy` dist-tag — so this did not require crossing a major.
- **The `<4` ceiling is load-bearing, not tidiness.** An unbounded `>=3.15.1` resolves js-yaml **4.3.0**, which (a) sits inside that same advisory's other vulnerable window (`>=4.0.0 <4.3.1`) and (b) breaks the build: js-yaml 4 removed `safeLoad`, which `gray-matter` calls, so every MDX file fails frontmatter parsing. Verified — the build failed on `content/issues/welcome-to-the-productivity-bug.mdx` before the ceiling was added.

The structural risk stands and remains a backlog item: an unmaintained parser is why an override is needed here at all.

### F6 — FIXED: the Next family is one unit

`@next/mdx` is pinned exactly like `next` and `eslint-config-next`. All three must be bumped together; the comment in F1's commit records that.

### F7 — FIXED: MDX packages relocated, one removed

`@types/mdx` (types-only) and `@mdx-js/loader` (build-time, required by `@next/mdx`) moved to `devDependencies`. `@mdx-js/react` removed — it was an optional peer of `@next/mdx`, unreferenced anywhere, and unnecessary because this repo provides `src/mdx-components.tsx`. `pnpm build` confirms MDX pages still render, which is the check that mattered.

### F8 — FIXED: `allowBuilds` trimmed to what exists

Now lists only `sharp` and `unrs-resolver`, the two packages in the tree with install scripts. The file states the rule so the list doesn't silently accumulate again: an entry here pre-approves install-time code execution, which is the primary npm-malware vector.

### F9 — ACCEPTED: no provenance on five direct deps

`dompurify`, `gray-matter`, `sugar-high`, `react-simple-code-editor`, `clsx` publish without attestations. There is no action to take — no maintained attested equivalent exists for these, and the original finding's own conclusion was "no action required now." Recorded as accepted, with provenance to be used as a selection criterion for anything newly added.

### F10 — DEFERRED by policy: maintenance drift

`sugar-high` 1.2.1 → 2.0.1 (major), `ai` 7.0.27 → 7.0.66, `lucide-react` 1.24.0 → 1.31.0, `@ai-sdk/google` 4.0.15 → 4.0.44. No advisory attaches to any of them.

Project policy is to update for a security fix or a deliberate major, not for currency, so these are intentionally not bumped. Worth revisiting on purpose rather than incidentally: the `ai` / `@ai-sdk/google` gap is where provider and streaming fixes land, and all three Server Actions run through that path — so a considered bump there is a reasonable future task, not drift to be swept up.

### Note — `brace-expansion` resolved itself; an override attempt was reverted

The original report raised no finding for the four dev-only `brace-expansion` advisories (ESLint's minimatch chain, no production exposure). Re-resolving during this pass lifted them to the patched **1.1.18** and **5.0.9** within their consumers' existing ranges, so `pnpm audit` is now clean without any override.

Recorded because the first attempt did harm: scoped overrides (`brace-expansion@1`, `brace-expansion@5`) forced a 5.x copy into the slot `minimatch@3` reads, and ESLint died with `expand is not a function` (5.x exports named, 1.x exports a CommonJS default). `pnpm-workspace.yaml` carries a comment so nobody re-adds it.

## Scorecard

| Category                       | Score | Δ   | Notes                                                                                                                                                                                                                  |
| ------------------------------ | ----- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version consistency            | 10/10 | +2  | The Next family (`next`, `eslint-config-next`, `@next/mdx`) is now uniformly exact-pinned; `react`/`react-dom` exact and matched; `zod` satisfies both AI-SDK peers.                                                   |
| Workspace protocol             | N/A   | —   | Skipped — single-package repo.                                                                                                                                                                                         |
| pnpm catalog                   | N/A   | —   | Skipped — one importer.                                                                                                                                                                                                |
| Unused deps                    | 10/10 | +3  | `@mdx-js/react` removed; the two build/type-only packages moved to `devDependencies`. Everything remaining traces to a real import, CSS `@import`, config reference, or declared peer.                                 |
| Missing / phantom deps         | 10/10 | —   | Every external import specifier resolves to a declared dep.                                                                                                                                                            |
| Duplicates                     | 9/10  | —   | Dev-tooling transitives only; singleton-sensitive packages remain single-copy (one `react`, `react-dom`, `next`, `zod`).                                                                                               |
| Removed-package regressions    | 10/10 | —   | Nothing deliberately dropped has crept back.                                                                                                                                                                           |
| Deprecated / unmaintained      | 10/10 | +3  | Zero deprecated packages, and `gray-matter` is gone — replaced by the maintained `yaml`, which also retired the `js-yaml` override it forced.                                                                          |
| Vulnerabilities & supply chain | 9/10  | +4  | **Zero advisories** (`pnpm audit` clean), down from 21. Lifecycle-script posture tightened to the two packages that need it. Deduction: five deps without provenance, and three security floors that need maintaining. |
| Lockfile                       | 10/10 | —   | One `pnpm-lock.yaml` in sync with the manifest; `packageManager` hash-pinned; CI installs `--frozen-lockfile`.                                                                                                         |

## Remaining action items

### Backlog

| #   | Priority | Task (finding ID)                                                                                                                                                                                               | Effort |
| --- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | ~~P3~~   | ~~Replace `gray-matter`~~ **DONE** — swapped for `yaml` + a regex; the `js-yaml` override is gone and js-yaml now resolves 4.3.1 on its own. Original: it is the only reason the `js-yaml` override exists (F5) | M      |
| 2   | P3       | A deliberate, tested bump of `ai` + `@ai-sdk/google` when convenient; those releases carry provider/streaming fixes on the path all three Server Actions use (F10)                                              | S      |
| 3   | ~~P3~~   | ~~Evaluate `sugar-high` 2.x~~ **DONE** — v2.0.1 keeps the same nine `--sh-*` names and `highlight(code)`; the breaking changes are in `parse`/`render`, which moved to `sugar-high/core` and aren't used (F10)  | S      |
| 4   | P3       | Re-check the `brace-expansion` override once ESLint's chain moves off `minimatch@3`                                                                                                                             | XS     |
| 5   | P3       | Prefer provenance-attested packages for new additions (F9)                                                                                                                                                      | XS     |

### Maintenance note

The three `overrides` entries are security controls with a shelf life. When a new advisory lands above one of those floors, the override keeps resolving a vulnerable version while appearing to protect — which is exactly how F2 arose. Each floor now carries its advisory IDs in a comment; re-read them whenever `next` is upgraded, since Next's transitive pins are what make the overrides necessary.
