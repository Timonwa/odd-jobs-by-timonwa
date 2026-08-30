import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";

/** Alt text for the Word & Character Counter OG image. */
export const alt =
	"Word & Character Counter — live word, character, and reading-time counts with platform limits";
/** Dimensions of the generated OG image. */
export const size = OG_SIZE;
/** MIME type of the generated OG image. */
export const contentType = OG_CONTENT_TYPE;

/** OG image for the Word & Character Counter tool page. */
export default function Image() {
	return renderOgImage({
		eyebrow: `Word & character counter · ${siteConfig.name}`,
		titleLead: "Word & Character",
		titleAccent: "Counter",
		subtitle:
			"Words, characters, sentences, and reading time — with live limits for SEO, X, Bluesky, and LinkedIn.",
		pills: ["Live counts", "Reading time", "Platform limits"],
		...OG_PALETTES.teal,
	});
}
