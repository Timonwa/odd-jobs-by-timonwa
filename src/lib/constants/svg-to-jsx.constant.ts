// Option lists and the seed markup for the SVG to JSX tool. Each union type is
// derived from its option list rather than declared beside it, so adding an
// option can't leave the type behind.

import type { IndentUnit } from "@/lib/utils/svg/format.utils";

/** Seeded into the input on mount so the tool is populated from the first paint. */
export const SVG_TO_JSX_SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
  <path d="M12 2 2 7l10 5 10-5-10-5Z" />
  <path d="m2 17 10 5 10-5" />
  <path d="m2 12 10 5 10-5" />
</svg>`;

export const SVG_TO_JSX_INDENTS: { label: string; value: IndentUnit }[] = [
	{ label: "2 spaces", value: "  " },
	{ label: "4 spaces", value: "    " },
	{ label: "Tab", value: "\t" },
];

export const SVG_TO_JSX_QUOTES = [
	{ label: "Double", value: "double" },
	{ label: "Single", value: "single" },
] as const;

export type SvgQuoteStyle = (typeof SVG_TO_JSX_QUOTES)[number]["value"];

export const SVG_TO_JSX_BACKGROUNDS = [
	{ id: "light", label: "Light" },
	{ id: "dark", label: "Dark" },
	{ id: "checkered", label: "Checkered" },
] as const;

export type SvgPreviewBackground =
	(typeof SVG_TO_JSX_BACKGROUNDS)[number]["id"];

export const SVG_TO_JSX_TABS = [
	{ value: "jsx", label: "JSX" },
	{ value: "preview", label: "Preview" },
] as const;

export type SvgOutputTab = (typeof SVG_TO_JSX_TABS)[number]["value"];

// Fill the pane (min the editor's height) so the preview bottom-aligns with the
// code editor even though the input card carries an extra size-controls row.
export const SVG_PREVIEW_FILL = "min-h-96 flex-1";
