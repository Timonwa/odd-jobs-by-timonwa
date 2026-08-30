import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";

/** Alt text for the Reading Time Estimator OG image. */
export const alt =
	"Reading Time Estimator — how long your article takes to read";
/** Dimensions of the generated OG image. */
export const size = OG_SIZE;
/** MIME type of the generated OG image. */
export const contentType = OG_CONTENT_TYPE;

/** OG image for the Reading Time Estimator tool page. */
export default function Image() {
	return renderOgImage({
		eyebrow: `Reading time estimator · ${siteConfig.name}`,
		titleLead: "Reading",
		titleAccent: "Time",
		subtitle:
			"Reading and speaking time at your pace — plus a copy-ready min-read label for your blog.",
		pills: ["Reading & speaking", "Adjustable WPM", "Min-read label"],
		...OG_PALETTES.sky,
	});
}
