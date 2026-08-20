// Inline background styles for the SVG preview pane. Literal colours rather than
// theme tokens on purpose: this is a fixed light/dark/checkered swatch the user
// picks to judge an icon against, so it must not follow the site theme.

import type { CSSProperties } from "react";

import type { SvgPreviewBackground } from "@/lib/constants";

// Classic checkerboard, so transparent icons read clearly. `size` in px.
const checker = (size: number): CSSProperties => ({
	backgroundColor: "#fff",
	backgroundImage:
		"linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)",
	backgroundSize: `${size}px ${size}px`,
	backgroundPosition: `0 0, 0 ${size / 2}px, ${size / 2}px -${size / 2}px, -${size / 2}px 0`,
});

/** Background style for a preview swatch or the preview pane itself; `size` sets the checkerboard square in px. */
export function svgPreviewBackgroundStyle(
	background: SvgPreviewBackground,
	size: number,
): CSSProperties {
	if (background === "light") return { backgroundColor: "#fff" };
	if (background === "dark") return { backgroundColor: "#171717" };
	return checker(size);
}
