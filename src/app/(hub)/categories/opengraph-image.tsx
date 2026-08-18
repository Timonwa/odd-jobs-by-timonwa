import { SITE_NAME } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";
import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
export const alt = `Tool categories — ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: `Categories · ${SITE_NAME}`,
		titleLead: "Browse by",
		titleAccent: "what you need",
		subtitle:
			"AI writing helpers, SEO, developer utilities, text, and media tools.",
		pills: ["AI writing", "SEO", "Developer", "Text"],
		...OG_PALETTES.brand,
	});
}
