import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";

// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
export const alt =
	"Article to SEO Meta — SEO-friendly titles and descriptions from a URL or pasted text, with character counts in spec";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: `SEO meta generator · ${siteConfig.name}`,
		titleLead: "Article to",
		titleAccent: "SEO Meta",
		subtitle:
			"From a URL or pasted text: titles 50-60 chars, descriptions 150-160 chars, with your keyword in every variation.",
		pills: ["URL or text", "Title 50-60", "Description 150-160"],
		...OG_PALETTES.amber,
	});
}
