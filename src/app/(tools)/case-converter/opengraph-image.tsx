import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
export const alt =
	"Case Converter — UPPERCASE, Title Case, camelCase, snake_case, and more";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Case converter · Open source",
		titleLead: "Case",
		titleAccent: "Converter",
		subtitle:
			"Switch text between UPPERCASE, Title Case, camelCase, snake_case, and more — then copy.",
		pills: ["17 cases", "Live preview", "One-click copy"],
		accent: "#fb7185",
		backgroundTint: "#4c0519",
	});
}
