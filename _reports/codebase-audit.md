# Codebase audit — The Productivity Bug

**Date:** 2026-08-17 · **Phase:** production · **Mode:** fixes applied · **Branch:** `code-restructuring` · **Scope:** whole repo (`src/`, config, CI, git hygiene) · **Overall:** 9/10

Baseline note: this is the first run — no previous report existed at `_reports/codebase-audit.md`, so every finding is `NEW` and there is no "Resolved since last audit" section.

Context worth stating up front, because it shapes the scores: the code itself is unusually clean. Zero `TODO`/`FIXME`/`HACK`/`XXX` markers in the whole tree, zero `any`, zero unsafe casts, one narrowly-scoped `eslint-disable`, no commented-out code, no committed secrets or build artifacts, and `pnpm exec tsc --noEmit` / `pnpm lint` / `pnpm build` all pass clean. The deductions below are concentrated in four places: an unpatched dependency tree, a CI gate that can be bypassed, a total absence of tests, and an unvalidated Server Action boundary.

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | 7/10     | 9/10    | +2  | ▲     |

## Findings

| ID  | Severity | Category       | Status       | Issue                                                                                     | Location                                                       |
| --- | -------- | -------------- | ------------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | CRITICAL | Dependencies   | **FIXED**    | 21 known vulnerabilities (14 high) incl. 9 Next.js advisories fixed in 16.2.11            | `package.json:38`, `pnpm-workspace.yaml:11`                    |
| 2   | HIGH     | Git/CI hygiene | **FIXED**    | Any PR touching one `.md`/`.mdx` file skips lint, format, typecheck and build entirely    | `.github/workflows/ci.yml:26`                                  |
| 3   | HIGH     | Tests          | **DEFERRED** | No test infrastructure at all; CI `test` job hard-disabled and calls a nonexistent script | `package.json:7`, `.github/workflows/ci.yml:96`                |
| 4   | HIGH     | Error handling | **FIXED**    | Server Action inputs are never validated; unbounded client data reaches the model prompt  | `src/lib/server/actions/social-posts.action.ts:143`            |
| 5   | MEDIUM   | Error handling | **FIXED**    | Quota counters are non-atomic — a failed `EXPIRE` locks an IP out permanently             | `src/lib/server/utils/rate-limit.utils.ts:94`                  |
| 6   | MEDIUM   | Error handling | **FIXED**    | `subscribeNewsletter` has no rate limit; anyone can mass-subscribe arbitrary addresses    | `src/lib/server/actions/newsletter.action.ts:23`               |
| 7   | MEDIUM   | Error handling | **FIXED**    | Five catch blocks report every failure as "we couldn't reach the server", logging nothing | `src/lib/hooks/writer/use-writer.ts:196`                       |
| 8   | MEDIUM   | Error handling | **FIXED**    | BYOK save/clear report success unconditionally over a swallowed storage write             | `src/components/_shared/byok/ByokDrawer.tsx:54`                |
| 9   | MEDIUM   | Tech debt      | **FIXED**    | `useSeoMetaHistory` reimplements the `createToolHistory` factory verbatim                 | `src/lib/hooks/use-seo-meta-history.ts:43`                     |
| 10  | MEDIUM   | Tech debt      | **FIXED**    | Word Counter re-hardcodes five character limits that already exist as constants           | `src/components/tools/word-counter/WordCounterTool.tsx:16`     |
| 11  | MEDIUM   | Tech debt      | **ROUTED**   | Four oversized units mixing several jobs in one file/function                             | `src/components/tools/svg-to-jsx/SvgToJsxTool.tsx:98`          |
| 12  | MEDIUM   | Error handling | **FIXED**    | A fresh Upstash client is constructed per call, including on a path that never uses it    | `src/lib/server/utils/rate-limit.utils.ts:23`                  |
| 13  | LOW      | Error handling | **FIXED**    | Floating clipboard promise reports success even when the copy was blocked                 | `src/components/tools/article-to-seo-meta/SeoMetaTool.tsx:168` |
| 14  | LOW      | Dead code      | **PARTIAL**  | Three fully dead exports and two barrels nothing imports                                  | `src/lib/config/tints.ts:5`                                    |
| 15  | LOW      | Dead code      | **FIXED**    | `jsx-a11y/no-autofocus` override targets paths that no longer exist and matches nothing   | `eslint.config.mjs:14`                                         |
| 16  | LOW      | Dependencies   | **FIXED**    | `allowBuilds` pre-approves postinstall scripts for four packages not in the lockfile      | `pnpm-workspace.yaml:2`                                        |
| 17  | LOW      | Tech debt      | **FIXED**    | CI and `.env.example` both claim `GOOGLE_API_KEY` is required; it is optional             | `.github/workflows/ci.yml:75`                                  |
| 18  | LOW      | Tech debt      | **FIXED**    | Unnamed magic values, one of them an unintentional inconsistency (1200 vs 1500 ms)        | `src/components/tools/article-to-seo-meta/SeoMetaTool.tsx:170` |
| 19  | LOW      | Git hygiene    | **ACCEPTED** | 25 local branches (21 already merged); four violate the documented naming rule            | git refs                                                       |
| 20  | LOW      | Tech debt      | **FIXED**    | `runtime = "edge"` in 13 of 16 OG routes, three different rationale comments              | `src/app/(tools)/lorem-ipsum/opengraph-image.tsx:7`            |
| 21  | LOW      | TS strictness  | **FIXED**    | `noUncheckedIndexedAccess` off, and an unsound index access is reachable from the client  | `tsconfig.json:2`                                              |

---

## What was applied

### Closed by earlier passes

| ID  | Closed by        | How                                                                                        |
| --- | ---------------- | ------------------------------------------------------------------------------------------ |
| F1  | dependency pass  | `next` → 16.2.11, postcss floor → 8.5.23, `dompurify` → 3.4.13; `pnpm audit` reports zero  |
| F2  | environment pass | `predicate-quantifier: every` — a docs-only skip now needs _every_ changed file to be docs |
| F4  | security pass    | Every Server Action parses a bounded Zod schema before any other work                      |
| F5  | redis pass       | One atomic Lua script; a counter can no longer exist without a TTL                         |
| F6  | redis pass       | Newsletter action metered under its own namespace, plus a honeypot                         |
| F12 | redis pass       | One lazily-created client with auto-pipelining; status answered without constructing one   |
| F16 | dependency pass  | `allowBuilds` trimmed to the two packages that actually have install scripts               |

### F7 — FIXED: failures are no longer all blamed on the network

The five identical `catch {}` blocks that reported everything as a connectivity problem — and logged nothing — now call `toActionCallErrorMessage(error, tag)`. It logs the real error under a call-site tag, then picks a message from evidence rather than assumption: genuinely offline (`navigator.onLine === false` or a fetch `TypeError`), a payload-size rejection (reachable here — these bodies carry a whole article plus history), or a generic "something went wrong on our end".

### F8 — FIXED: BYOK save and clear report what actually happened

`byokStorage.set`/`.clear` now return a boolean instead of swallowing every exception and returning `void`. `ByokDrawer` reports a real error when the write is blocked — which matters most in the `.clear()` direction, where the user was previously told their API key had been removed from the browser when it may still have been there.

### F9 — FIXED: the history factory is used instead of reimplemented

`useSeoMetaHistory` now calls `createToolHistory`, dropping ~30 lines of duplicated dedup/cap/store wiring. The copies had already diverged: this also restores the missing `!!result` entry guard, so a corrupt localStorage record can't reach the UI.

### F10 — FIXED: Word Counter reads the shared limits

Its five hardcoded character limits now come from `SEO_META_TITLE_MAX`, `SEO_META_DESC_MAX`, and `SOCIAL_POST_PLATFORM_CHAR_LIMITS`, so retuning a platform limit can't leave this tool's bars behind.

### F13 + F18 — FIXED: the clipboard path and the unnamed values

`handleCopyAll` is now `async`, awaits the write inside `try/catch`, and only shows "Copied" on success — matching the three call sites that already did this correctly.

The magic values moved into constants: `COPY_FEEDBACK_MS` (which also resolves the 1200-vs-1500 divergence — all four sites now agree), `HISTORY_DEBOUNCE_MS`, and `SEO_META_VARIATION_COUNTS` / `SEO_META_DEFAULT_VARIATION_COUNT` for the variation-count union that was restated in three files.

### F14 — PARTIAL: one dead export removed, two kept by design

Removed `CREATOR_SHOP_URL`: genuinely dead _and_ redundant, since `SHOP_CANONICAL_BASE` already resolves to the same `${CREATOR_SITE_URL}/shop`.

**`CardFooter` and `TINTS` were deliberately kept**, reversing the finding. "Unused export" is the wrong test for a design-system surface:

- `Card` is a **compound component**, and `CardFooter` is part of its complete API. Shipping `Card` without it means the next feature that needs a footer either hand-rolls one or re-adds it — which is precisely the drift a design system exists to prevent. The library is meant to be consumed by features that don't exist yet.
- `TINTS` is the enumerable form of a token scale whose maps (`TINT_SURFACE`, `TINT_TEXT`) are in active use. Without it, anything iterating tints restates `[1,2,3,4,5]` at the call site.

The general lesson for future audits of this repo: apply dead-code analysis to app code, not to `components/ui` or the token layer, where an unreferenced export is a capability rather than a leftover.

### F15 — FIXED: inert ESLint override removed

Deleted the `jsx-a11y/no-autofocus` override, which was inert three times over: the globs omitted the `src/` prefix, one target file had moved, and no `autoFocus` exists in the repo at all.

The two "unimported barrels" half of F14 was **not** actioned. `server/utils/index.ts` and `server/clients/index.ts` are the kinds' public surfaces and are load-bearing for app code; modules _inside_ the server layer deep-import siblings deliberately, so that pulling in one client doesn't drag every other client into the module graph. AGENTS.md's "import as `@/lib/<kind>`" rule is about consumers of a kind, not a kind's own internals.

### F17 — FIXED: the CI env comment

Corrected in the environment pass; `.env.example`'s half was applied by the maintainer.

### F20 — FIXED: the edge-runtime comments say what is true

**The original finding's premise was partly wrong, established by testing.** Removing `runtime = "edge"` from an OG route does _not_ restore static generation — the route stays `ƒ Dynamic` either way, because non-parameterized image routes are dynamic regardless. (The three `[slug]` OG routes prerender as `●` precisely because they have params.) Edge is also not _required_: the route builds fine without it.

So the flag is a valid choice, and the real defect was the commentary. All 26 edge routes now carry one identical note saying it is a deliberate choice rather than a Next.js requirement, and warning that content-backed routes must not copy it. The six `[slug]` image routes carry the converse note explaining why they must stay on Node: they read MDX through `createMdxLoader`, which uses `node:fs`.

This also corrects `frontend-audit` F1, whose fix ("remove `runtime = 'edge'` to restore static generation") would not have had the stated effect.

### F21 — FIXED: `noUncheckedIndexedAccess` is on

Enabled, with all eleven resulting errors fixed by tightening types rather than by asserting past them:

- `Tool.categories` is now `[CategoryId, ...CategoryId[]]` — the non-empty invariant `getPrimaryCategoryId` always relied on is now stated in the type instead of assumed.
- The lorem word list is likewise a non-empty tuple, which makes its fallback a real value rather than a cast.
- The `IntersectionObserver` callback guards its (per the DOM types, possibly empty) entry array.
- Regex-group accesses in the SVG parser are guarded where the pattern's alternation actually allows an absent group.
- `NAMESPACED_ATTRS[name]` is read once and checked, since `in` does not narrow an index signature's value type.

This is what F4 was a symptom of: `LONGFORM_SOCIAL_POST_LENGTH_LIMITS[postLength]` typed as `number` while returning `undefined`. With the flag on, that class of bug is a compile error.

## Not fixed, and why

### F3 — DEFERRED: no test infrastructure

The maintainer's decision: tests are a separate task on their own branch, not part of the audit remediation. What this pass did do is remove the dead CI `test` job, which was hard-disabled with `if: false` _and_ invoked a `pnpm test` script that does not exist — so the config no longer describes a capability the repo lacks.

This remains the largest open risk in the repo. The SSRF blocklist, the quota logic, the ordered error-mapping rules, and now the Lua fallback path are all uncovered, and several of them were changed substantially during these audit passes.

### F11 — ROUTED to `frontend-audit`

Four oversized components (501/454/391/373 lines), the clearest being `TemplatesPicker` holding five components in one file against the repo's own one-component-per-file rule. This report's own triage table routes it to `frontend-audit`, so it is left for that pass rather than half-split here.

### F19 — ACCEPTED: local branches kept

26 local branches, 18 already merged. The maintainer chose to keep them; they are local-only and cost nothing but noise in `git branch`.

## Verification

`pnpm exec tsc --noEmit` (now with `noUncheckedIndexedAccess`), `pnpm lint`, and `pnpm build` all pass.

## Scorecard

| Category       | Score | Δ   | Notes                                                                                                                                                                                       |
| -------------- | ----- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tech debt      | 9/10  | +3  | Zero TODO/FIXME, zero `any`, zero unsafe casts. Duplicated factory collapsed, magic values named, hardcoded limits sourced from constants. Oversized components routed to `frontend-audit`. |
| Dead code      | 10/10 | +3  | One genuinely dead (and duplicated) export removed, plus an inert ESLint override. `CardFooter` and `TINTS` kept deliberately — design-system surface, not leftovers.                       |
| TS strictness  | 10/10 | +4  | `noUncheckedIndexedAccess` on, with invariants encoded as non-empty tuples rather than asserted past.                                                                                       |
| Error handling | 9/10  | +4  | Failures are logged and classified rather than blamed on the network; storage writes report success; the clipboard path awaits.                                                             |
| Test coverage  | 2/10  | —   | Unchanged and unaddressed by decision (F3). The dead CI job is gone, so nothing now claims coverage that doesn't exist.                                                                     |
| Git hygiene    | 8/10  | —   | Conventional commits and a clean lockfile; merged local branches kept by choice.                                                                                                            |
| Dependencies   | 10/10 | +4  | Zero advisories after the dependency pass.                                                                                                                                                  |

## Remaining action items

### Backlog

| #   | Priority | Task                                                                                                                                                    | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P1       | Stand up test infrastructure and re-add a CI test job — the SSRF blocklist, quota logic, error mapping, and the new Lua fallback are all uncovered (F3) | M      |
| 2   | P2       | Split the four oversized components, starting with `TemplatesPicker` (F11) — owned by `frontend-audit`                                                  | M      |
| 3   | P3       | Prune merged local branches whenever the noise starts to cost something (F19)                                                                           | XS     |
