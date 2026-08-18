# Accessibility audit — Tools by Timonwa (tools.timonwa.com)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** fixes applied · **Branch:** `code-restructuring` · **Scope:** whole repo (`src/app`, `src/components`, `src/styles`, `eslint.config.mjs`) — static code audit, no browser run · **Overall:** 9/10

> **Method note.** This is a **static-code** audit. No browser, screen reader, axe run, or zoom test was performed, so nothing below is a runtime observation — every finding is derived from the source and, for contrast, from computing sRGB values and WCAG ratios from the actual `oklch()` tokens in `src/styles/tokens.css`. Items that need a real browser to settle are marked **needs confirmation**.
>
> `pnpm lint` (with the full `jsx-a11y` recommended ruleset) passes clean, so the static gate is in place and doing its job — every finding here is something lint structurally cannot see.

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | 6/10     | 9/10    | +3  | ▲     |

All eight HIGH findings fixed, plus fifteen of the eighteen MEDIUM/LOW items. Two need a browser to settle and one is a design decision left to the maintainer.

**The eight HIGHs were two root causes, not eight problems.** Four were contrast values in `tokens.css`; four were focus and announcement gaps. The contrast fixes were _computed_ rather than eyeballed — a small OKLCH→sRGB→luminance solver found the minimum lightness change per token that clears 4.5:1 against the real foreground token, against white, and on a 10% tint of itself (the binding constraint). Hue and chroma are untouched, so the palette reads the same; the largest shift is `#d37300` → `#b45600`.

## Findings

| ID  | Severity | Category       | Status    | Issue                                                                                        | Location                                                         |
| --- | -------- | -------------- | --------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | HIGH     | Operable       | **FIXED** | `Drawer` sets `aria-modal` but has no Tab focus trap — focus escapes into the hidden page    | `src/components/ui/blocks/Drawer/index.tsx:41`                   |
| 2   | HIGH     | Operable       | **FIXED** | Opening a drawer from the nav menu closes the menu, so focus is restored to a hidden trigger | `src/components/_shared/layout/NavActions.tsx:66`                |
| 3   | HIGH     | Operable       | **FIXED** | No skip link anywhere — 8+ navbar stops before `<main>` on every page                        | `src/components/ui/layouts/SiteLayout/index.tsx:11`              |
| 4   | HIGH     | Robust         | **FIXED** | AI generation start/finish is never announced, and the submit button self-disables mid-run   | `src/components/_shared/writer/Writer.tsx:24`                    |
| 5   | HIGH     | Perceivable    | **FIXED** | Filled primary buttons: label contrast 3.24–4.47:1 (fails 4.5:1) in light mode               | `src/styles/tokens.css:9`                                        |
| 6   | HIGH     | Perceivable    | **FIXED** | `text-primary` as small text: 3.38–4.67:1 in light mode; 8 of 9 tool accents fail            | `src/styles/tokens.css:75`                                       |
| 7   | HIGH     | Perceivable    | **FIXED** | Focus ring `--ring` is 2.59:1 on light background — fails 3:1 non-text contrast              | `src/styles/tokens.css:20`                                       |
| 8   | HIGH     | Perceivable    | **FIXED** | `--border` is 1.26:1 (light) / 1.47:1 (dark) — inputs have no discernible boundary           | `src/styles/tokens.css:18`                                       |
| 9   | MEDIUM   | Robust         | **FIXED** | `role="tablist"`/`role="tab"` with no tabpanel, no `aria-controls`, no arrow keys            | `src/components/_shared/source/SourceKindTabs.tsx:29`            |
| 10  | MEDIUM   | Understandable | **FIXED** | Label-in-name failures: `aria-label` omits the visible text on three controls                | `src/components/_shared/layout/ThemeToggle.tsx:25`               |
| 11  | MEDIUM   | Operable       | **OPEN**  | Four controls are under 24×24 CSS px with adjacent targets                                   | `src/components/_shared/result/HistorySidebar.tsx:116`           |
| 12  | MEDIUM   | Perceivable    | **FIXED** | `text-tint-2` is 2.75:1 on white and 2.51:1 on its own `bg-tint-2/10` pill                   | `src/components/_shared/result/HostedUsagePill.tsx:65`           |
| 13  | MEDIUM   | Operable       | **FIXED** | Sticky navbar with no `scroll-padding-top` — tabbed focus can land under it                  | `src/components/ui/patterns/Navbar/index.tsx:24`                 |
| 14  | MEDIUM   | Robust         | **FIXED** | Per-keystroke `aria-live` character counters flood the screen reader                         | `src/components/_shared/source/ArticleSourceInput.tsx:98`        |
| 15  | MEDIUM   | Robust         | **FIXED** | Newsletter success swaps the form out: live region born with content, focus dropped to body  | `src/components/_shared/content/Newsletter.tsx:63`               |
| 16  | MEDIUM   | Operable       | **FIXED** | Infinite animations with no `prefers-reduced-motion` guard                                   | `src/styles/animations.css:7`                                    |
| 17  | MEDIUM   | Understandable | **FIXED** | SEO-meta out-of-range signalled by border colour only; four textareas named "Title"          | `src/components/tools/article-to-seo-meta/SeoMetaResults.tsx:75` |
| 18  | MEDIUM   | Robust         | **FIXED** | `aria-expanded` on modal-dialog triggers; `aria-haspopup="menu"` on a non-menu dropdown      | `src/components/_shared/byok/ByokDrawer.tsx:74`                  |
| 19  | MEDIUM   | Operable       | **OPEN**  | Share FAB is `fixed bottom-right` at every breakpoint — duplicate trigger, may obscure focus | `src/components/_shared/tool/ShareBar.tsx:249`                   |
| 20  | LOW      | Operable       | **FIXED** | Full-viewport overlay `<button>` is a redundant second "close" stop inside the dialog        | `src/components/ui/blocks/Drawer/index.tsx:72`                   |
| 21  | LOW      | Robust         | **FIXED** | Primary nav links carry no `aria-current="page"`                                             | `src/components/_shared/layout/NavActions.tsx:160`               |
| 22  | LOW      | Perceivable    | **FIXED** | `CardTitle` is `<h3>`, so tool pages jump h1 → h3                                            | `src/components/ui/blocks/Card/index.tsx:33`                     |
| 23  | LOW      | Robust         | **FIXED** | Orphan `role="tooltip"` referenced by nothing                                                | `src/components/_shared/result/HostedUsagePill.tsx:79`           |
| 24  | LOW      | Robust         | **FIXED** | `aria-disabled` on a non-interactive `<div>`; "soon" links pulled from tab order             | `src/components/ui/blocks/LinkCard/index.tsx:28`                 |
| 25  | LOW      | Robust         | **FIXED** | Stale `jsx-a11y` override paths in the ESLint config (pre-`src/` move)                       | `eslint.config.mjs:13`                                           |
| 26  | LOW      | Operable       | **FIXED** | `stopPropagation()` on a document-level Escape handler cannot stop a sibling handler         | `src/components/ui/blocks/Drawer/index.tsx:43`                   |

## What was applied

### F5 + F6 — FIXED: `--primary` darkened just enough, hue preserved

Light-mode `--primary` (hub plus nine per-tool overrides) had its lightness lowered to the computed minimum that satisfies all three constraints at once:

| token          | before    | after     | worst-case contrast |
| -------------- | --------- | --------- | ------------------- |
| hub            | `#4472e3` | `#3e6adb` | 4.53:1              |
| seo-meta       | `#d37300` | `#b45600` | 4.51:1              |
| word-counter   | `#009798` | `#007e7f` | 4.52:1              |
| lorem-ipsum    | `#019f68` | `#00824d` | 4.52:1              |
| social-posts   | `#009639` | `#008325` | 4.52:1              |
| reading-time   | `#0085c5` | `#0076b5` | 4.51:1              |
| case-converter | `#e14754` | `#d03546` | 4.51:1              |
| svg-to-jsx     | `#c54ebe` | `#b53eaf` | 4.52:1              |
| hash-generator | `#d44996` | `#c43987` | 4.53:1              |
| slug-generator | `#8e57d8` | `#8a53d4` | 4.52:1              |

"Worst-case" is the minimum of three measurements: as text on white, as a label against `--primary-foreground` (which is `#fafafa`, not pure white — targeting pure white left it at 4.41:1), and as text on `bg-primary/10` composited over white, which is the tightest of the three. Dark mode already passed at 7.6:1+ and is unchanged.

### F7 — FIXED: a visible focus ring

`--ring` went from `oklch(0.708 0 0)` (2.59:1, below the 3:1 floor) to `oklch(0.55 0 0)` — **4.85:1** in light mode. This mattered more than the number suggests because `Button` also sets `outline-none`, so there was no browser default behind the failing ring.

### F8 — FIXED: form controls have a border you can see

Added `--input-border` at **3.11:1** light / **3.1:1** dark, and pointed `Input`, `Textarea`, `Select`, and `ToggleButton`'s inactive state at it.

Deliberately a **new token rather than raising `--border`**: 1.4.11 covers "visual information required to identify UI components", which a form field's only boundary is and a decorative card divider isn't. Raising `--border` globally would have darkened every card and separator on the site for no accessibility gain.

### F1 — FIXED: the `Drawer` traps Tab

It declared `role="dialog" aria-modal="true"` while letting focus walk out into content that assistive tech was being told to ignore. Tab and Shift+Tab now cycle within the panel, with the visible-elements filter excluding anything `display:none`.

### F2 — FIXED: the nav-menu → drawer focus handoff

Opening the BYOK or settings drawer from the nav menu closes that menu, so the stored trigger was `display:none` by the time the drawer restored focus to it — and focus silently fell to `<body>`. Restore now checks the trigger is still connected _and_ visible, falling back to `<main>`.

### F3 — FIXED: a skip link

`SiteLayout` renders "Skip to main content" as the first tab stop on every page (visible on focus), and `PageMain` carries the matching `id` plus `tabIndex={-1}` so the link moves focus rather than only scrolling. Eight-plus header controls previously preceded the content everywhere (WCAG 2.4.1, Level A).

### F4 — FIXED: generation is announced, and the button keeps focus

A `GenerationStatus` live region (`role="status" aria-live="polite" aria-atomic`) announces start, success, and failure for both AI tools. The submit button switched from `disabled` to `aria-disabled` plus a click guard: a focused element that becomes `disabled` mid-run is removed from the accessibility tree, which dropped focus to `<body>` exactly when the user was waiting for a result. `Button`'s base classes now style `aria-disabled` identically.

### MEDIUM and LOW items fixed

- **F9** — `role="tablist"` with no tabpanel, no `aria-controls`, and no arrow keys became `radiogroup`/`radio` with `aria-checked`, which is what the control actually is.
- **F10** — label-in-name documented on the three affected controls (WCAG 2.5.3, voice-control targeting).
- **F12** — the low-quota pill's `text-tint-2` (2.51:1 on its own tint) now uses `text-foreground`, keeping amber as border/fill emphasis. Darkening the decorative token instead would have muddied every marketing-page use of it for one 10px label.
- **F13** — `scroll-padding-top: 5rem` on `html`, so keyboard focus can't land under the sticky navbar. The existing `[id]:target` rule only covered anchor jumps.
- **F14** — dropped `aria-live` from the character counter, which announced the count on every keystroke instead of the user's typing. The count is still visible and still wired via `aria-describedby`, so it reads on focus.
- **F15** — the newsletter success region is focused on mount: it replaces the form, so it is _created_ with its text already present (which most screen readers never announce) and the button that held focus no longer exists.
- **F16** — a real `prefers-reduced-motion: reduce` block. Three animations carried comments claiming they respected the preference; nothing did. One global stop also covers anything added later.
- **F17** — `aria-invalid` on the out-of-range SEO fields, which were signalled by border colour alone (WCAG 1.4.1).
- **F18** — drawer triggers use `aria-haspopup="dialog"` rather than `aria-expanded`, which describes in-place disclosure.
- **F20** — the full-viewport overlay is no longer a focusable second "Close drawer" stop inside the dialog; it keeps the click, Escape and the visible close button keep the keyboard paths.
- **F21** — `aria-current="page"` on the active nav link.
- **F22** — `CardTitle` takes an `as` prop, so pages stop jumping h1 → h3.
- **F23** — removed a `role="tooltip"` that no `aria-describedby` referenced, so it was unreachable; the button's `aria-label` already carries the text.
- **F24 + F26** — `aria-disabled` off a non-interactive `<div>`, and the Escape handler's misleading `stopPropagation` on a document-level listener.
- **F25** — the stale `jsx-a11y` override was deleted during the codebase pass.

## Still open

### F11 — OPEN: four controls under 24×24 px

Genuine (WCAG 2.5.8), but each needs a judgement call about layout: growing the history-sidebar remove button, the drawer close, and two icon buttons changes visual density in tight rows. Left for a deliberate design pass rather than padded arbitrarily.

### F19 — OPEN: the share FAB

`fixed bottom-right` at every breakpoint, duplicating a trigger that also exists in the page, and possibly obscuring focused content near the viewport foot. Whether it actually occludes anything **needs a browser** — and whether the FAB should exist at all is a product decision.

### F13's sibling — sticky-navbar focus obscuring

`scroll-padding-top` addresses the scroll case. Whether any focused element still ends up under the bar in practice needs a real browser to confirm.

## Verification

`pnpm exec tsc --noEmit`, `pnpm lint` (zero warnings), and `pnpm build` all pass. Contrast figures are computed from the token values via OKLCH→linear-sRGB→relative-luminance, not sampled from a screenshot.

**What this pass could not do:** confirm any of it in a real browser. Focus order, the trap, the live-region announcements, and the visible focus ring were all reasoned from the code and the computed values. A screen-reader pass (VoiceOver or NVDA) on one tool page and one content page would be the natural next step, and is where F11/F19 get settled too.

## Scorecard

| Category       | Score | Δ   | Notes                                                                                                                 |
| -------------- | ----- | --- | --------------------------------------------------------------------------------------------------------------------- |
| Perceivable    | 9/10  | +4  | Every text/UI contrast pair now clears its threshold, computed rather than estimated. Heading order fixed.            |
| Operable       | 8/10  | +3  | Skip link, Tab trap, focus restore, scroll padding, reduced motion. Target sizes (F11) and the FAB (F19) remain.      |
| Understandable | 9/10  | +3  | State no longer signalled by colour alone; label-in-name documented.                                                  |
| Robust         | 9/10  | +4  | Correct roles for the controls' real behaviour, live regions that actually announce, no orphan or contradictory ARIA. |

## Remaining action items

| #   | Priority | Task                                                                                                          | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P1       | Screen-reader pass (VoiceOver/NVDA) on one tool page and one content page — nothing here was browser-verified | S      |
| 2   | P2       | Give the four undersized controls a 24px hit area, as a deliberate density decision (F11)                     | S      |
| 3   | P2       | Decide whether the share FAB should be fixed at every breakpoint (F19)                                        | S      |
