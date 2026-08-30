import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";

export const alt =
	"Article to Social Posts — turn an article into a post tailored to each network: X, LinkedIn, Threads, Bluesky, Mastodon, and Substack";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: `Social post generator · ${siteConfig.name}`,
		titleLead: "Article to",
		titleAccent: "Social Posts",
		subtitle:
			"Turn an article into a post tailored to each network — with tone, hashtag rules, and threads.",
		pills: ["6 platforms", "URL or text", "Multi-post threads"],
		...OG_PALETTES.emerald,
	});
}
