// The OG-card palette. Every social image draws from here rather than repeating
// raw hexes across ~20 route files, so a brand-colour change is one edit and a
// card can't quietly drift off-palette.
//
// These are deliberately literal rather than CSS custom properties: OG images
// render in an isolated `ImageResponse` document with no access to the site's
// stylesheet, so a token reference would resolve to nothing.

export type OgPalette = {
	/** Foreground accent — the highlighted half of the title, pills, and rules. */
	accent: string;
	/** Deep background wash behind the card. */
	backgroundTint: string;
};

export const OG_PALETTES = {
	/** Hub default — the site's own indigo. Used by every non-tool card. */
	brand: { accent: "#818cf8", backgroundTint: "#1e1b4b" },
	amber: { accent: "#f59e0b", backgroundTint: "#3b2410" },
	emerald: { accent: "#34d399", backgroundTint: "#052e1e" },
	green: { accent: "#34d399", backgroundTint: "#022c22" },
	teal: { accent: "#2dd4bf", backgroundTint: "#042f2e" },
	sky: { accent: "#60a5fa", backgroundTint: "#172554" },
	violet: { accent: "#c084fc", backgroundTint: "#2e1065" },
	fuchsia: { accent: "#e879f9", backgroundTint: "#4a044e" },
	rose: { accent: "#fb7185", backgroundTint: "#4c0519" },
} as const satisfies Record<string, OgPalette>;

export type OgPaletteName = keyof typeof OG_PALETTES;
