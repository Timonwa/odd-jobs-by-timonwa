import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

/** Edge runtime flag — required by Next.js for OG image routes using ImageResponse. */
export const runtime = "edge";
/** Alt text for the Lorem Ipsum Generator open-graph image. */
export const alt = "Lorem Ipsum Generator — placeholder text in one click";
/** Pixel dimensions of the generated open-graph image. */
export const size = OG_SIZE;
/** MIME type of the generated open-graph image. */
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Lorem ipsum · Open source",
		titleLead: "Lorem Ipsum",
		titleAccent: "Generator",
		subtitle:
			"Placeholder paragraphs, sentences, or words in one click — pick how much, regenerate, and copy.",
		pills: ["Paragraphs", "Sentences", "Words"],
		accent: "#34d399",
		backgroundTint: "#022c22",
	});
}
