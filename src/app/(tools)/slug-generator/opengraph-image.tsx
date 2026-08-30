import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";

/** Alt text for the Slug Generator OG image. */
export const alt = "Slug Generator — turn any text into a clean, URL-safe slug";
/** Dimensions of the generated OG image. */
export const size = OG_SIZE;
/** MIME type of the generated OG image. */
export const contentType = OG_CONTENT_TYPE;

/** OG image for the Slug Generator tool page. */
export default function Image() {
	return renderOgImage({
		eyebrow: `Slug generator · ${siteConfig.name}`,
		titleLead: "Slug",
		titleAccent: "Generator",
		subtitle:
			"Turn any title, heading, or text into a clean, URL-safe slug — accents stripped, separator your call.",
		pills: ["URL-safe", "Stop words", "One-click copy"],
		...OG_PALETTES.violet,
	});
}
