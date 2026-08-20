import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { buildOgImageConfig, getIndexedSeo } from "@/lib/config/page-seo";
import { OG_PALETTES } from "@/lib/constants";
import { siteConfig } from "@/lib/config/site";

// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
export const alt = `Newsletter — ${siteConfig.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		...buildOgImageConfig(getIndexedSeo("newsletter")),
		...OG_PALETTES.brand,
	});
}
