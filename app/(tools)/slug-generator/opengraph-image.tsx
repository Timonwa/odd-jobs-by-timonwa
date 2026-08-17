import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

/** Edge runtime declaration for the OG image route. */
export const runtime = "edge";
/** Alt text for the Slug Generator OG image. */
export const alt = "Slug Generator — turn any text into a clean, URL-safe slug";
/** Dimensions of the generated OG image. */
export const size = OG_SIZE;
/** MIME type of the generated OG image. */
export const contentType = OG_CONTENT_TYPE;

/** OG image for the Slug Generator tool page. */
export default function Image() {
	return renderOgImage({
		eyebrow: "Slug generator · Open source",
		titleLead: "Slug",
		titleAccent: "Generator",
		subtitle:
			"Turn any title, heading, or text into a clean, URL-safe slug — accents stripped, separator your call.",
		pills: ["URL-safe", "Stop words", "One-click copy"],
		accent: "#c084fc",
		backgroundTint: "#2e1065",
	});
}
