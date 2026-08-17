import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

export const runtime = "edge";
export const alt =
	"Article to SEO Meta — SEO-friendly titles and descriptions from a URL or pasted text, with character counts in spec";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "SEO meta generator · Open source",
		titleLead: "Article to",
		titleAccent: "SEO Meta",
		subtitle:
			"From a URL or pasted text: titles 50-60 chars, descriptions 150-160 chars, with your keyword in every variation.",
		pills: ["URL or text", "Title 50-60", "Description 150-160"],
		accent: "#f59e0b",
		backgroundTint: "#3b2410",
	});
}
