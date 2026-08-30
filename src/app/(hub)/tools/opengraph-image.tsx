import { buildOgImageConfig, getIndexedSeo } from "@/lib/config/page-seo";
import { OG_PALETTES } from "@/lib/constants";
import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";

export const alt = `All tools — ${siteConfig.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		...buildOgImageConfig(getIndexedSeo("tools")),
		...OG_PALETTES.brand,
	});
}
