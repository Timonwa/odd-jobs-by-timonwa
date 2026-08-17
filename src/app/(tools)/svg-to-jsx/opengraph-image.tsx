import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
export const alt = "SVG to JSX Converter — turn raw SVG into a React component";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "SVG to JSX · Open source",
		titleLead: "SVG to",
		titleAccent: "JSX",
		subtitle:
			"Paste raw SVG, get clean JSX — React-named attributes, style objects, and an optional typed component.",
		pills: ["React / JSX", "camelCase attrs", "One-click copy"],
		accent: "#e879f9",
		backgroundTint: "#4a044e",
	});
}
