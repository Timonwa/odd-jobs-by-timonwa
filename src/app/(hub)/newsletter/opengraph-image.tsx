import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { SITE_NAME } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";
import { NEWSLETTER_PAGE_COPY } from "@/lib/data";

// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
export const alt = `Newsletter — ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: `Newsletter · ${SITE_NAME}`,
		titleLead: "Productivity, in your",
		titleAccent: "inbox",
		subtitle: NEWSLETTER_PAGE_COPY.description,
		pills: ["Tools", "Posts", "Notes"],
		...OG_PALETTES.brand,
	});
}
