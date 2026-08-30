import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { buildOgImageConfig, getIndexedSeo } from "@/lib/config/page-seo";
import { OG_PALETTES } from "@/lib/constants";
import { siteConfig } from "@/lib/config/site";

export const alt = `Blog — ${siteConfig.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		...buildOgImageConfig(getIndexedSeo("blog")),
		...OG_PALETTES.brand,
	});
}
