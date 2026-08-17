# Accessibility audit — Tools by Timonwa (tools.timonwa.com)

**Date:** 2026-08-17 · **Phase:** production · **Mode:** Report-only · **Branch:** `code-restructuring` · **Scope:** whole repo (`src/app`, `src/components`, `src/styles`, `eslint.config.mjs`) — static code audit, no browser run · **Overall:** 6/10

> **Method note.** This is a **static-code** audit. No browser, screen reader, axe run, or zoom test was performed, so nothing below is a runtime observation — every finding is derived from the source and, for contrast, from computing sRGB values and WCAG ratios from the actual `oklch()` tokens in `src/styles/tokens.css`. Items that need a real browser to settle are marked **needs confirmation**.
>
> `pnpm lint` (with the full `jsx-a11y` recommended ruleset) passes clean, so the static gate is in place and doing its job — every finding here is something lint structurally cannot see.

## Score change (previous → current)

| Metric  | Previous | Current | Δ   | Trend |
| ------- | -------- | ------- | --- | ----- |
| Overall | N/A      | 6/10    | N/A | N/A   |

First run — no prior report in `_reports/`.

## Findings

| ID  | Severity | Category       | Status | Issue                                                                                        | Location                                                         |
| --- | -------- | -------------- | ------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | HIGH     | Operable       | NEW    | `Drawer` sets `aria-modal` but has no Tab focus trap — focus escapes into the hidden page    | `src/components/ui/blocks/Drawer/index.tsx:41`                   |
| 2   | HIGH     | Operable       | NEW    | Opening a drawer from the nav menu closes the menu, so focus is restored to a hidden trigger | `src/components/_shared/layout/NavActions.tsx:66`                |
| 3   | HIGH     | Operable       | NEW    | No skip link anywhere — 8+ navbar stops before `<main>` on every page                        | `src/components/ui/layouts/SiteLayout/index.tsx:11`              |
| 4   | HIGH     | Robust         | NEW    | AI generation start/finish is never announced, and the submit button self-disables mid-run   | `src/components/_shared/writer/Writer.tsx:24`                    |
| 5   | HIGH     | Perceivable    | NEW    | Filled primary buttons: label contrast 3.24–4.47:1 (fails 4.5:1) in light mode               | `src/styles/tokens.css:9`                                        |
| 6   | HIGH     | Perceivable    | NEW    | `text-primary` as small text: 3.38–4.67:1 in light mode; 8 of 9 tool accents fail            | `src/styles/tokens.css:75`                                       |
| 7   | HIGH     | Perceivable    | NEW    | Focus ring `--ring` is 2.59:1 on light background — fails 3:1 non-text contrast              | `src/styles/tokens.css:20`                                       |
| 8   | HIGH     | Perceivable    | NEW    | `--border` is 1.26:1 (light) / 1.47:1 (dark) — inputs have no discernible boundary           | `src/styles/tokens.css:18`                                       |
| 9   | MEDIUM   | Robust         | NEW    | `role="tablist"`/`role="tab"` with no tabpanel, no `aria-controls`, no arrow keys            | `src/components/_shared/source/SourceKindTabs.tsx:29`            |
| 10  | MEDIUM   | Understandable | NEW    | Label-in-name failures: `aria-label` omits the visible text on three controls                | `src/components/_shared/layout/ThemeToggle.tsx:25`               |
| 11  | MEDIUM   | Operable       | NEW    | Four controls are under 24×24 CSS px with adjacent targets                                   | `src/components/_shared/result/HistorySidebar.tsx:116`           |
| 12  | MEDIUM   | Perceivable    | NEW    | `text-tint-2` is 2.75:1 on white and 2.51:1 on its own `bg-tint-2/10` pill                   | `src/components/_shared/result/HostedUsagePill.tsx:65`           |
| 13  | MEDIUM   | Operable       | NEW    | Sticky navbar with no `scroll-padding-top` — tabbed focus can land under it                  | `src/components/ui/patterns/Navbar/index.tsx:24`                 |
| 14  | MEDIUM   | Robust         | NEW    | Per-keystroke `aria-live` character counters flood the screen reader                         | `src/components/_shared/source/ArticleSourceInput.tsx:98`        |
| 15  | MEDIUM   | Robust         | NEW    | Newsletter success swaps the form out: live region born with content, focus dropped to body  | `src/components/_shared/content/Newsletter.tsx:63`               |
| 16  | MEDIUM   | Operable       | NEW    | Infinite animations with no `prefers-reduced-motion` guard                                   | `src/styles/animations.css:7`                                    |
| 17  | MEDIUM   | Understandable | NEW    | SEO-meta out-of-range signalled by border colour only; four textareas named "Title"          | `src/components/tools/article-to-seo-meta/SeoMetaResults.tsx:75` |
| 18  | MEDIUM   | Robust         | NEW    | `aria-expanded` on modal-dialog triggers; `aria-haspopup="menu"` on a non-menu dropdown      | `src/components/_shared/byok/ByokDrawer.tsx:74`                  |
| 19  | MEDIUM   | Operable       | NEW    | Share FAB is `fixed bottom-right` at every breakpoint — duplicate trigger, may obscure focus | `src/components/_shared/tool/ShareBar.tsx:249`                   |
| 20  | LOW      | Operable       | NEW    | Full-viewport overlay `<button>` is a redundant second "close" stop inside the dialog        | `src/components/ui/blocks/Drawer/index.tsx:72`                   |
| 21  | LOW      | Robust         | NEW    | Primary nav links carry no `aria-current="page"`                                             | `src/components/_shared/layout/NavActions.tsx:160`               |
| 22  | LOW      | Perceivable    | NEW    | `CardTitle` is `<h3>`, so tool pages jump h1 → h3                                            | `src/components/ui/blocks/Card/index.tsx:33`                     |
| 23  | LOW      | Robust         | NEW    | Orphan `role="tooltip"` referenced by nothing                                                | `src/components/_shared/result/HostedUsagePill.tsx:79`           |
| 24  | LOW      | Robust         | NEW    | `aria-disabled` on a non-interactive `<div>`; "soon" links pulled from tab order             | `src/components/ui/blocks/LinkCard/index.tsx:28`                 |
| 25  | LOW      | Robust         | NEW    | Stale `jsx-a11y` override paths in the ESLint config (pre-`src/` move)                       | `eslint.config.mjs:13`                                           |
| 26  | LOW      | Operable       | NEW    | `stopPropagation()` on a document-level Escape handler cannot stop a sibling handler         | `src/components/ui/blocks/Drawer/index.tsx:43`                   |

### F1 — `Drawer` claims a focus trap it does not implement

- **What:** The JSDoc says "overlay + focus-trapped panel" and the markup sets `role="dialog" aria-modal="true"`, but the effect at `Drawer/index.tsx:41` only registers an `Escape` handler and an initial `focusTarget?.focus()`. There is no `keydown` handler for `Tab`/`Shift+Tab`, no `inert`/`aria-hidden` applied to the page behind, and no wrap-around at the first/last focusable element. Tabbing past the last control in the panel walks straight into the navbar and page content behind the overlay.
- **Why it matters:** `aria-modal="true"` tells assistive tech that everything outside the dialog is unavailable, so a screen-reader user who tabs out is moved to content their AT is actively hiding — the classic "lost in a modal" failure. Affects the BYOK drawer and the writing-style settings drawer, i.e. the primary configuration surface of both AI tools. WCAG 2.4.3 Focus Order, 4.1.2 Name/Role/Value.
- **Fix:** Add a `Tab` handler in the same effect that queries focusable descendants of `panelRef` and cycles first↔last, or render the drawer with the native `<dialog>` element's `showModal()` which traps focus and makes the backdrop inert for free. Either way the fix lands once in this primitive and covers every consumer.

### F2 — Focus is destroyed when a drawer is opened from the nav menu

- **What:** `NavActions` mounts a document-level `mousedown` handler that closes the dropdown whenever the click target is outside `ref` (`NavActions.tsx:68-70`). Both drawers are triggered from inside that dropdown (`ByokDrawer` at `NavActions.tsx:178`, the settings drawer via `menuSlot`), and `Drawer` portals to `document.body` — outside `ref`. So the first click or keypress inside an open drawer closes the dropdown, which is hidden with the `hidden` class (`NavActions.tsx:157`, `display: none`). On close, `Drawer`'s cleanup calls `previouslyFocused.current?.focus?.()` (`Drawer/index.tsx:58`) on a trigger that is now `display: none`; `.focus()` on a non-rendered element is a no-op, so focus falls back to `<body>`. The same happens via Escape: both handlers are bound to `document`, and `e.stopPropagation()` in `Drawer` (see F26) does not stop a sibling listener on the same node, so one Escape closes the drawer _and_ the menu.
- **Why it matters:** A keyboard or screen-reader user who closes the drawer is dumped at the top of the document and has to re-traverse the whole page to get back — the exact harm WCAG 2.4.3 Focus Order and 3.2.x predictability exist to prevent. It is the default path, since the BYOK drawer has no trigger outside the menu.
- **Fix:** Keep the dropdown open while a portaled child is open (skip the outside-click close when a drawer owns the focus), and make `Drawer` fall back to a still-visible anchor when `previouslyFocused` is no longer focusable (`if (!el?.isConnected || !el.offsetParent) document.querySelector('[data-nav-menu-button]')?.focus()`).

### F3 — No skip link on any page

- **What:** `grep -rni "skip"` over `src` returns only a marketing string in `HostedUsagePill`. Neither `app/layout.tsx`, `SiteLayout`, nor `PageMain` renders a "skip to content" link, and `<main>` has no `id` to target. Every page puts the same cluster ahead of the content: brand link, Tools switcher + its search field, theme toggle, support link, GitHub link, menu button, breadcrumbs, and the share button.
- **Why it matters:** Keyboard and switch users must tab through the entire repeated header on every page load before reaching page content. WCAG 2.4.1 Bypass Blocks (Level A) — the one Level-A failure in this report that affects 100% of pages.
- **Fix:** Add `id="main-content"` to `PageMain`'s `<main>` (and to the three hand-rolled `<main>`s in `home/index.tsx:16`, `errors/not-found`, `errors/error`), then render a first-child anchor in `SiteLayout`: `<a href="#main-content" className="sr-only focus:not-sr-only …">Skip to main content</a>`.

### F4 — AI results are never announced, and focus is lost while generating

- **What:** `Writer.tsx` renders the result block with no live region — the only reaction to completion is `resultsRef.current?.scrollIntoView()` (`Writer.tsx:24-31`). `SeoMetaTool.tsx` is the same shape. Progress is conveyed purely visually, by swapping the submit button's text to "Generating posts…" (`GenerateForm.tsx:171-183`), while that same button is disabled for the duration (`disabled={disabled}` where `disabled` includes `isBusy`, `GenerateForm.tsx:97,169`). A grep for `aria-live`/`role="status"`/`role="alert"`/`<output>` finds five hits in the whole codebase, none of them in `Writer.tsx` or `SeoMetaTool.tsx`.
- **Why it matters:** Two failures compound. (a) Disabling the element that currently holds focus moves focus to `<body>` in Chromium, so the user loses their place at the exact moment the app becomes busy. (b) Nothing tells a screen-reader user that generation started, that it finished, or that several cards of content appeared — a multi-second server action completes in total silence. WCAG 4.1.3 Status Messages (AA), 2.4.3 Focus Order.
- **Fix:** Add a polite status region that lives in the DOM across the whole cycle (mounted empty, then filled): `<p role="status" className="sr-only">{isGenerating ? "Generating posts…" : result ? \`Generated ${n} posts\` : ""}</p>`. Prefer `aria-disabled`+ an early return in the submit handler over the`disabled` attribute so focus survives, or move focus to the results heading once the result lands.

### F5 — Filled primary buttons fail text contrast in light mode

- **What:** Computed from `tokens.css`: hub `--primary` `oklch(0.58 0.18 265)` → `#4472e3`, and `--primary-foreground` `oklch(0.985 0 0)` on it gives **4.24:1**. The per-tool `--primary` overrides (`tokens.css:75-124`) are worse — Article to SEO Meta `#d37300` → **3.24:1**, Lorem Ipsum **3.26:1**, Word Counter **3.42:1**, Social Posts **3.72:1**, Case Converter **3.83:1**, Hash **3.86:1**, Reading Time **3.89:1**, SVG to JSX **3.87:1**. Only Slug Generator (4.47:1) gets close, and none reaches 4.5:1. This is the `default` Button variant (`Button/index.tsx:15`) at `text-sm` — normal-size text, so the 4.5:1 threshold applies. Dark mode is fine (7.6:1+).
- **Why it matters:** The primary call to action on every tool page — "Generate posts", "Save key", "Get it" — has sub-threshold label contrast for the majority of users, who are on the default light theme. WCAG 1.4.3 Contrast (Minimum).
- **Fix:** Darken the light-mode `--primary` values by roughly `0.06–0.10` L (e.g. hub `0.50`, seo-meta `0.55`) until `--primary-foreground` clears 4.5:1, keeping the dark-mode pairs as they are. The per-tool block is the single place to change.

### F6 — `text-primary` fails contrast as small text in light mode

- **What:** Same tokens read the other way: `--primary` as a foreground on `--background`/`--card` (both `oklch(1 0 0)`) gives hub **4.42:1**, seo-meta **3.38:1**, lorem **3.41:1**, word-counter **3.57:1**, social-posts **3.89:1**, case-converter **4.00:1**, hash **4.03:1**, svg-to-jsx **4.04:1**, reading-time **4.06:1**, slug **4.67:1** (the only pass). On the tinted surfaces it is used with, it drops further: `text-primary` on `bg-primary/10` is **3.91:1** hub, **3.03:1** seo-meta. `text-primary` appears in 51 places, including `PageHero`'s eyebrow pill (`PageHero/index.tsx:31`, 12–14px), the SEO in-range badge (`SeoMetaResults.tsx:64`, 11px), the ToolsMenu current-tool row, `StatCard` highlights, and the BYOK success notices.
- **Why it matters:** These are small, informational text runs — status badges and labels that carry meaning. WCAG 1.4.3.
- **Fix:** Same token darkening as F5 covers most of it; for text on `bg-primary/*` surfaces add an explicit on-surface token (e.g. `--primary-on-tint` a few steps darker) rather than reusing `--primary` for both the fill and the text on the fill.

### F7 — The default focus ring is invisible enough to fail non-text contrast

- **What:** `--ring` is `oklch(0.708 0 0)` → `#a1a1a1`, **2.59:1** against the light background and card. `Button`'s base class uses it for the only focus affordance (`focus-visible:ring-2 focus-visible:ring-ring`, `Button/index.tsx:34`), as does `Breadcrumbs` (`Breadcrumbs/index.tsx:56`), and `Button` also sets `outline-none`, so there is no browser default to fall back on. Dark mode is 4.18:1 and passes. (For contrast, the form primitives use `focus:ring-primary` — 3.03–4.42:1 — which does clear 3:1.)
- **Why it matters:** Every button on the site — including the ones inside the drawers, the menu, and the share sheet — gets a mid-grey ring on white that fails the 3:1 floor for a focus indicator. A keyboard user cannot reliably see where they are. WCAG 1.4.11 Non-text Contrast (and 2.4.7 Focus Visible in substance).
- **Fix:** Set light-mode `--ring` to something around `oklch(0.45 0 0)` (≈7:1), or point the ring at `--primary`/`--foreground` so it inherits the per-tool accent. One token, whole-app effect.

### F8 — Control borders are effectively invisible

- **What:** `--border` and `--input` are `oklch(0.922 0 0)` → `#e5e5e5`, **1.26:1** against the light background. In dark mode `--border` is `oklch(1 0 0 / 10%)` → **1.25:1** and `--input` `/15%` → **1.47:1**. `Input`, `Textarea`, and `Select` (`Input/index.tsx:15`, `Textarea/index.tsx:13`, `Select/index.tsx:16`) all use `border-border` over `bg-background` — the border is the _only_ thing distinguishing the field from the page, since fill and page share the same colour. `ToggleButton`'s inactive state and `outline` buttons are in the same position.
- **Why it matters:** WCAG 1.4.11 requires 3:1 for "visual information required to identify user interface components and their states". A field the user cannot locate is a field they cannot fill in — this hits the paste-article textarea, the URL field, and the BYOK key input.
- **Fix:** Introduce a dedicated control-boundary token at ≥3:1 (light ≈ `oklch(0.70 0 0)`, dark ≈ `oklch(1 0 0 / 35%)`) and use it on `Input`/`Textarea`/`Select`/`ToggleButton`, leaving the softer `--border` for purely decorative dividers and card edges (which have no contrast requirement).

### F9 — The source-kind tabs are broken ARIA tabs

- **What:** `SourceKindTabs` puts `role="tablist"` on a `<div>` and `role="tab" aria-selected` on two `<button>`s (`SourceKindTabs.tsx:29-55`), but: no element anywhere carries `role="tabpanel"`, the tabs have no `aria-controls`, there is no roving `tabIndex`, and no `keydown` handler for ArrowLeft/ArrowRight/Home/End. The panel it nominally controls is the sibling `if (sourceKind === "url") … else …` block in `ArticleSourceInput` (`ArticleSourceInput.tsx:66-135`), which has no tab semantics at all.
- **Why it matters:** The roles promise a widget contract the code does not honour. A screen reader announces "tab, 1 of 2, selected" and the user presses the arrow keys — nothing happens — and there is no panel relationship to navigate to. Incorrect ARIA is worse than none: a plain pair of buttons would behave correctly. WCAG 4.1.2 Name/Role/Value.
- **Fix:** Either drop the tab roles and reuse the existing `SegmentedControl` primitive (`role="group"` + `aria-pressed`, already correct), or complete the pattern: `aria-controls` → a panel with `role="tabpanel"`, `aria-labelledby`, `tabIndex={0}`, plus roving tabindex and arrow-key handling.

### F10 — Three controls have an accessible name that omits their visible label

- **What:** `ThemeToggle`'s menu row renders the visible text "System mode" but sets `aria-label={`Theme: ${theme}`}` (`ThemeToggle.tsx:25,34-37`) — `aria-label` wins, so the accessible name is "Theme: system", which does not contain "System mode". `ByokDrawer`'s trigger shows "Set API key" with `aria-label="API key — your own key is active"` (`ByokDrawer.tsx:73-78`). `HostedUsagePill` shows "20 free/day" or "3 of 20 left" with `aria-label` set to the long `summary` string — "Add your own Gemini key" / "3 of 20 free generations left today…" (`HostedUsagePill.tsx:61,76`).
- **Why it matters:** WCAG 2.5.3 Label in Name (Level A) requires the visible label text to be contained in the accessible name. Speech-input users say what they see ("click set API key") and the command does not match. It also makes screen-reader output disagree with the screen for anyone reading along.
- **Fix:** Let the visible text be the name and move the extra detail to `aria-describedby` (or a `sr-only` suffix): e.g. keep `<span>Set API key</span>` unlabelled and add `<span className="sr-only"> — your own key is active</span>`. Same shape for the theme row ("System mode" + sr-only "theme") and the usage pill.

### F11 — Four controls are smaller than 24×24 CSS px

- **What:** From the class strings: `HistorySidebar`'s "Remove" is `text-[10px]` with a 12px icon and no padding (`HistorySidebar.tsx:116-123`) — roughly 14px tall, directly adjacent to the entry's load button; `TagList`'s per-tag remove button is a bare `<button>` around a `w-3 h-3` icon inside a `Badge` (`HashtagsSection.tsx:149-157`) — ~12px, and tags sit 6px apart; `Breadcrumbs`' collapse toggle is `px-1` around a 16px icon (`Breadcrumbs.tsx:51-59`) — ~16px tall; `HostedUsagePill`'s button is `py-1 text-[10px]` (`HostedUsagePill.tsx:58-68`) — ~20px tall.
- **Why it matters:** WCAG 2.5.8 Target Size (Minimum) (AA, new in 2.2) requires 24×24 CSS px unless the undersized target is separated by a 24px-diameter no-overlap gap — which the adjacent-target spacing here does not provide. Motor-impaired and touch users mis-tap, and on the history list a mis-tap loads the wrong generation.
- **Fix:** Give each an explicit `min-h-6 min-w-6` (24px) hit area with `inline-flex items-center justify-center`, keeping the icon visually small. Padding is enough — no visual redesign needed.

### F12 — The amber tint fails contrast wherever it carries text

- **What:** `--tint-2` `oklch(0.7 0.15 70)` → `#d98b09` is **2.75:1** on white, and **2.51:1** on the `bg-tint-2/10` surface it is paired with in `TINT_SURFACE[2]` (`src/lib/config/tints.ts:12`). It is used as text in the low-quota state of the usage pill (`HostedUsagePill.tsx:65`, 10–12px) and for the "close to the limit" SEO badge (`SeoMetaResults.tsx:65`). For reference, `--tint-4` (3.36:1) and `--tint-1`/`--tint-5` (~3.9:1) also fall short of 4.5:1 as text, though the audited code only uses them for icon tiles and borders. Dark mode passes comfortably (8.7:1+).
- **Why it matters:** The amber state is precisely the warning state — the message a user most needs to read. WCAG 1.4.3.
- **Fix:** Darken light-mode `--tint-2` to about `oklch(0.55 0.13 70)` (and `--tint-4` similarly) for text use, or split the palette into a decorative fill token and a darker `text-tint-*-strong` token, so the `TINT_SURFACE` maps stay usable for text.

### F13 — Focus can land under the sticky navbar

- **What:** The navbar is `sticky top-0 z-40` and roughly 60–68px tall (`Navbar/index.tsx:24`). The only scroll-offset compensation in the CSS is `[id]:target { scroll-margin-top: 5rem }` (`base.css:12`), which applies solely to fragment-navigation targets. There is no `scroll-padding-top` on `html`, so when the browser scrolls a newly focused element into view during tabbing (which it does by aligning to the nearest edge), an element just above the fold can come to rest underneath the sticky bar.
- **Why it matters:** WCAG 2.4.11 Focus Not Obscured (Minimum) (AA, new in 2.2) — a focused control that is hidden behind a sticky region is a failure even though it is technically focused. **Needs confirmation** in a browser for the exact overlap, but the missing `scroll-padding-top` is objective.
- **Fix:** Add `html { scroll-padding-top: 5rem }` in `base.css` alongside the existing `:target` rule. That fixes tabbing, anchors, and `scrollIntoView` in one line. Also worth re-checking the share FAB (F19) for the same class of overlap.

### F14 — Character counters announce on every keystroke

- **What:** `ArticleSourceInput` puts `aria-live="polite"` on the "1,204 / 15,000" counter and also wires it in as the textarea's `aria-describedby` (`ArticleSourceInput.tsx:98-107,116`). `PostCard` uses `<output aria-label={…}>` for the per-post counter (`PostCard.tsx:115-120`); `<output>` has an implicit `role="status"`, i.e. it is a live region too. Both values change on every single character typed.
- **Why it matters:** A polite live region that updates per keystroke turns typing into a stream of interruptions and can drown out the text the user is actually composing. WCAG 4.1.3 is satisfied in letter but the result is unusable in practice — the standard remedy is to announce only at meaningful thresholds.
- **Fix:** Drop `aria-live` and keep the `aria-describedby` link (the counter is then read on focus and on demand), or gate announcements: keep a debounced `role="status"` node that only fires when crossing the limit ("over the 15,000 character limit by 42").

### F15 — Newsletter success message is unlikely to be announced, and drops focus

- **What:** On success the entire `<form>` is replaced by `<p role="status">{state.message}</p>` (`Newsletter.tsx:63-70`). The live region is therefore inserted into the DOM already containing its text, which most screen readers do not announce (a `status` region must be present and empty before its content changes). Because the form — and with it the submit button that had focus — unmounts, focus falls back to `<body>`.
- **Why it matters:** A user who subscribes gets no confirmation and no idea where they are in the page. WCAG 4.1.3 Status Messages, 2.4.3 Focus Order. (The error branch at `:91-99` uses `role="alert"`, which _is_ announced on insertion, and is correctly tied to the input via `aria-describedby` — that half is right.)
- **Fix:** Render the `role="status"` node unconditionally (empty when idle) and swap only its text, and either keep the form mounted with the message beside it, or move focus to the confirmation with `tabIndex={-1}` + `ref.focus()`.

### F16 — Infinite animations are not gated on `prefers-reduced-motion`

- **What:** `.hero-gradient-text` runs `animation: hero-gradient-shift 5s linear infinite` with no media query (`animations.css:7-19`); it is applied to part of the `<h1>` on the home hero (`HomeHero.tsx:22`), every AI tool hero (`SocialPostsHero.tsx:13`), and category pages (`CategoryDetail.tsx:38`). `ByokDrawer`'s "key is active" dot uses `animate-ping` (infinite) at `ByokDrawer.tsx:81`. The `Drawer` panel animates in with `animate-in slide-in-from-right duration-300` (`Drawer/index.tsx:82`) and the overlay with `fade-in-0`. The app's only reduced-motion query is the smooth-scroll gate at `base.css:15`; the two decorative animations that _are_ gated use `motion-safe:` (`PageHero/index.tsx:36`, `WhatItIs.tsx:68`), so the convention exists — it just was not applied here.
- **Why it matters:** Continuously moving text is a migraine/vestibular trigger and, for the gradient on an `<h1>`, sits directly under the eye while reading. WCAG 2.2.2 Pause, Stop, Hide covers automatic motion that runs longer than 5s; 2.3.3 (AAA) covers the rest.
- **Fix:** Wrap the two `@keyframes` consumers in `@media (prefers-reduced-motion: no-preference)` (or add a global `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important } }`), and switch `animate-ping`/`animate-in` to their `motion-safe:` variants.

### F17 — SEO-meta length errors are colour-only and the fields share names

- **What:** In `SeoMetaResults`'s `Field`, an out-of-range value adds `border-destructive focus:ring-destructive` to the textarea (`SeoMetaResults.tsx:79-82`) but sets no `aria-invalid`, and the badge that holds the actual numbers (`SeoMetaResults.tsx:60-71`) is not referenced by `aria-describedby`. So programmatically the field looks fine. Separately, each variation card renders `<Textarea aria-label="Title">` and `aria-label="Description"` (`:76`), and the page renders several variation cards (`:56-66`) — four textareas called "Title" with nothing distinguishing them, since "Variation 1" lives in a `CardTitle` that is not associated with the fields.
- **Why it matters:** The error state is conveyed by colour alone to anyone not seeing the border (1.4.1 Use of Color), and the state is invisible to AT (3.3.1 Error Identification). The duplicate names make the screen reader's form-elements list — a primary navigation tool — unusable (1.3.1 / 2.4.6).
- **Fix:** Add `aria-invalid={over || under}` and `aria-describedby={badgeId}` on the textarea, give the badge a stable id, and scope the label per card: `aria-label={\`Variation ${index} title\`}`.

### F18 — Misapplied ARIA on the drawer triggers and the tools dropdown

- **What:** `ByokDrawer`'s trigger sets `aria-expanded={open}` (`ByokDrawer.tsx:74`) and both `SettingsDrawer` triggers do the same (`SettingsDrawer.tsx:59,71`) — but they open a portaled modal dialog, not an inline disclosure the button contains. `ToolsMenu`'s trigger declares `aria-haspopup="menu"` (`ToolsMenu.tsx:43`) while the popup it controls is a `<div>` holding a search `<input>` and a `<ul>` of links (`ToolsMenu.tsx:60-158`) — no `role="menu"`, no `role="menuitem"`, and no arrow-key navigation.
- **Why it matters:** `aria-expanded` on a dialog trigger is a documented anti-pattern (the trigger's state is not what changes; the dialog appears elsewhere in the tree), and `aria-haspopup="menu"` promises a menu keyboard contract the dropdown does not implement, so arrow-key users will try and fail. WCAG 4.1.2. The nav dropdown next door (`NavActions.tsx:137-158`) gets this right — `aria-expanded` + `aria-controls` on a real disclosure with no `haspopup` claim.
- **Fix:** Remove `aria-expanded` from the three drawer triggers (the dialog's own `role`/`aria-modal` carries the state). Change `aria-haspopup="menu"` to `aria-haspopup="true"` — or drop it, since `aria-expanded` + `aria-controls` already describe the disclosure correctly.

### F19 — The share FAB is pinned over the content at every breakpoint

- **What:** `ShareBar` renders two triggers for one `open` state: an inline "Share tool" button in `<div className="relative hidden sm:block">` and a floating one in `<div className="fixed bottom-4 right-4 md:right-6 lg:right-8 z-40">` (`ShareBar.tsx:227` and `ShareBar.tsx:250`). The inline one is correctly hidden below `sm`, but the FAB has no `sm:hidden` — the code comment says "Below sm: floating action button", so the intent and the classes disagree. Both are therefore present and focusable at ≥640px, and the FAB overlays the bottom-right of every tool page.
- **Why it matters:** Two tab stops with the same purpose and (`aria-controls` aside) near-identical names; and a persistently pinned control over content is the standard 2.4.11 Focus Not Obscured hazard, as well as a reflow concern at 320px/200% zoom where the FAB can cover the content it floats above. **Needs confirmation** in a browser for the actual overlap; the missing `sm:hidden` is objective from the class string.
- **Fix:** Add `sm:hidden` to the FAB wrapper so the two triggers are mutually exclusive, as the comment intends.

### F20 — The drawer overlay is a second, full-viewport close button

- **What:** The overlay is `<button type="button" aria-label="Close drawer" className="absolute inset-0 …">` (`Drawer/index.tsx:72-77`), inside `role="dialog"` and before the panel in DOM order, alongside the real close button labelled "Close" (`:107-114`).
- **Why it matters:** Shift+Tab from the panel's first control reaches a viewport-sized button, and AT users hear two close affordances with two different names for the same dialog. Not a violation on its own — dismissal is available and Escape works — but it is noise in a dialog that should have exactly one close control.
- **Fix:** Make the overlay a non-focusable `<div>` with an `onClick` and `aria-hidden` (click-to-dismiss stays a pointer nicety; keyboard users have Escape and the "Close" button), and keep a single accessible name.

### F21 — The primary nav links do not mark the current page

- **What:** The nav dropdown maps `NAV_LINKS` to plain `<Link>`s with no current-page state (`NavActions.tsx:160-173`), even though `ToolsMenu` does this correctly for tools (`aria-current={isCurrent ? "page" : undefined}`, `ToolsMenu.tsx:95`) and `Breadcrumbs` marks its last crumb (`Breadcrumbs.tsx:83`).
- **Why it matters:** A screen-reader user cannot tell from the menu which of Home / Tools / Categories / Blog / Shop / Newsletter they are on. Best practice under 4.1.2; the repo's own convention already exists next door.
- **Fix:** Use `usePathname()` (already imported in `ToolsMenu`) and set `aria-current="page"` on the matching link.

### F22 — Card titles skip a heading level

- **What:** `CardTitle` renders `<h3>` (`Card/index.tsx:33`). On an AI tool page the heading sequence is `<h1>` from `PageHero` (`PageHero/index.tsx:49`) followed directly by the `GenerateForm` card's `<h3>` "Generate social media posts" (`GenerateForm.tsx:105`) — no `<h2>` in between. `ArticleCard` then nests an `<h4>` under its own `<h3>`, which is fine.
- **Why it matters:** Heading-level jumps break outline navigation for screen-reader users skimming by heading. WCAG 1.3.1 (and 2.4.10 AAA).
- **Fix:** Let `CardTitle` take a level (`as?: "h2" | "h3" | "h4"`, defaulting to `h3`) and pass `as="h2"` for the top-level card on tool pages, or wrap the tool in a `<section>` with a visually-hidden `<h2>`.

### F23 — Orphan `role="tooltip"`

- **What:** `HostedUsagePill` renders `<span role="tooltip">{summary}</span>` (`HostedUsagePill.tsx:79-84`) that no element references via `aria-describedby`. It is always in the DOM (revealed by CSS on hover/focus-within), so its text is also read as ordinary content, duplicating the long `aria-label` on the button.
- **Why it matters:** `role="tooltip"` with no owning element is meaningless to AT and the duplicate text is redundant verbosity. Not a violation, but the shared `Tooltip` primitive does this correctly (`aria-hidden` bubble + labelled trigger, `Tooltip/index.tsx:26`).
- **Fix:** Reuse the `Tooltip` primitive here, or mark the bubble `aria-hidden` and keep the name on the button (see F10 for shortening that name).

### F24 — Dead ARIA on disabled cards and unreachable "soon" links

- **What:** `LinkCard`'s disabled branch renders a plain `<div aria-disabled>` (`LinkCard/index.tsx:28-31`) — `aria-disabled` has no meaning on an element with no interactive role. In `ToolsMenu`, "soon" tools stay as `<Link>`s with `aria-disabled` plus `tabIndex={-1}` and a `preventDefault()` click handler (`ToolsMenu.tsx:96-104`).
- **Why it matters:** `tabIndex={-1}` removes them from the keyboard path entirely, so keyboard users cannot even read the "Soon" badge in the menu — an inconsistency with mouse users. The `aria-disabled` div is harmless but misleading.
- **Fix:** Drop `aria-disabled` from the `<div>` (the "Soon" badge already carries the meaning), and for the menu prefer `role="link" aria-disabled="true"` on a focusable element, or render "soon" entries as plain non-focusable `<span>`s with the badge — consistently unreachable rather than half-reachable.

### F25 — Stale `jsx-a11y` exceptions in the ESLint config

- **What:** `eslint.config.mjs:13-19` disables `jsx-a11y/no-autofocus` for `components/tools/article-to-social-posts/writer/TemplatesPicker.tsx` and `components/tools/slug-generator/SlugGeneratorTool.tsx`. Neither path exists — components now live under `src/`, and `TemplatesPicker` is at `src/components/_shared/writer/TemplatesPicker.tsx`. A grep for `autoFocus` across `src` returns nothing, so the exceptions guard code that no longer exists.
- **Why it matters:** No live impact (`pnpm lint` is clean), but the block documents "reviewed autofocus exceptions" that are neither reviewed nor in effect — the next person to add `autoFocus` gets a lint error and a comment claiming it was already sanctioned.
- **Fix:** Delete the override block, or repoint the globs to `src/**` if autofocus is reintroduced.

### F26 — `stopPropagation` in the drawer's Escape handler does nothing

- **What:** `Drawer`'s keydown handler calls `e.stopPropagation()` before `onOpenChange(false)` (`Drawer/index.tsx:42-45`). The listener is attached to `document`, and the other Escape handler in play — `NavActions.tsx:71-73` — is also attached to `document`. Propagation between two listeners on the same node is not affected by `stopPropagation()` (that needs `stopImmediatePropagation()`), and even then it would depend on registration order.
- **Why it matters:** It is the mechanism that was supposed to prevent F2's cascade, so the code reads as if the case were handled when it is not. Fixing F2 properly supersedes it.
- **Fix:** Remove the call (or replace it with the explicit ownership check described in F2) so the intent matches the behaviour.

## Scorecard

| Category       | Score | Notes                                                                                                                                                                                                     |
| -------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Perceivable    | 5/10  | Structure and alt handling are solid, but four token-level contrast failures (primary as fill and as text, `--ring`, `--border`) reach every page in light mode.                                          |
| Operable       | 5/10  | No skip link, no focus trap in the one modal primitive, focus destroyed on the drawer path, four sub-24px targets, ungated infinite animation.                                                            |
| Understandable | 7/10  | Every form control has a real programmatic label, errors are text with `role="alert"`, `autoComplete`/`inputMode` are right; loses points for label-in-name and the un-programmatic SEO length state.     |
| Robust         | 6/10  | Native elements throughout, `jsx-a11y` recommended wired into CI and green; broken tab pattern, absent status messages for async AI results, and misapplied `aria-expanded`/`aria-haspopup` pull it down. |

## Action items

### Fix Now

| #   | Priority | Task (finding ID)                                                                                           | Effort |
| --- | -------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| 1   | P0       | Add a skip link + `id="main-content"` on all four `<main>`s (F3)                                            | S      |
| 2   | P0       | Darken light-mode `--primary` (hub + 9 tool overrides) so labels and text clear 4.5:1 (F5, F6)              | S      |
| 3   | P0       | Raise `--ring` to ≥3:1 in light mode (F7)                                                                   | XS     |
| 4   | P0       | Add a ≥3:1 control-boundary token and use it on Input/Textarea/Select/ToggleButton (F8)                     | S      |
| 5   | P0       | Implement a real Tab trap in `Drawer` (or move to native `<dialog>`) (F1)                                   | M      |
| 6   | P0       | Keep the nav dropdown open behind portaled drawers and harden focus restore (F2, F26)                       | M      |
| 7   | P1       | Add a persistent `role="status"` for generation start/finish; stop disabling the focused submit button (F4) | M      |

### Next Release

| #   | Priority | Task (finding ID)                                                                              | Effort |
| --- | -------- | ---------------------------------------------------------------------------------------------- | ------ |
| 8   | P1       | Replace the fake tab pattern with `SegmentedControl`, or complete it (F9)                      | S      |
| 9   | P1       | Fix the three label-in-name controls (F10)                                                     | S      |
| 10  | P1       | Give the four undersized controls a 24px hit area (F11)                                        | S      |
| 11  | P1       | Darken `--tint-2` (and `--tint-4`) for text use (F12)                                          | XS     |
| 12  | P1       | Add `html { scroll-padding-top: 5rem }` (F13)                                                  | XS     |
| 13  | P1       | Add `sm:hidden` to the share FAB wrapper (F19)                                                 | XS     |
| 14  | P2       | Gate `.hero-gradient-text`, `animate-ping`, and the drawer transitions on reduced motion (F16) | S      |
| 15  | P2       | Make the newsletter status region persistent and move focus to it (F15)                        | S      |
| 16  | P2       | Add `aria-invalid` + `aria-describedby` and per-variation field names in SEO meta (F17)        | S      |
| 17  | P2       | Remove `aria-expanded` from the drawer triggers; drop `aria-haspopup="menu"` (F18)             | XS     |
| 18  | P2       | Debounce or threshold the live character counters (F14)                                        | S      |

### Backlog

| #   | Priority | Task (finding ID)                                                                                                               | Effort |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 19  | P3       | Make the drawer overlay non-focusable; one close control (F20)                                                                  | XS     |
| 20  | P3       | `aria-current="page"` on the primary nav links (F21)                                                                            | XS     |
| 21  | P3       | Give `CardTitle` a configurable heading level (F22)                                                                             | S      |
| 22  | P3       | Reuse the `Tooltip` primitive in `HostedUsagePill` (F23)                                                                        | XS     |
| 23  | P3       | Clean up `aria-disabled`/`tabIndex={-1}` on disabled cards and "soon" rows (F24)                                                | XS     |
| 24  | P3       | Delete the stale `jsx-a11y` override block (F25)                                                                                | XS     |
| 25  | P3       | Run a real browser pass — axe, VoiceOver, 200% zoom / 320px reflow — to confirm F13 and F19 and catch what static review cannot | M      |

## Resolved since last audit

First run — nothing to compare.
