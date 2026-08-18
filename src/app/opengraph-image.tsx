import { SITE_NAME } from "@/lib/config/site";
import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { OG_PALETTES } from "@/lib/constants";

// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
export const alt = `${SITE_NAME} — Free, focused tools for writers, developers, and creators`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "${SITE_NAME} · Free · Open source",
		titleLead: "Free tools that",
		titleAccent: "get it done",
		subtitle:
			"Free, focused tools that knock out the tedious parts of writing and code. No sign-up.",
		pills: ["Free", "No sign-up", "Open source"],
		...OG_PALETTES.brand,
	});
}
