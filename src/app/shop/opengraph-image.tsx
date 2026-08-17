import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
export const alt = "Shop — The Productivity Bug";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Shop · The Productivity Bug",
		titleLead: "Products that get",
		titleAccent: "things done",
		subtitle:
			"Notion templates and digital products — built and used by me to help you get things done.",
		pills: ["Notion", "Templates", "Digital"],
		accent: "#818cf8",
		backgroundTint: "#1e1b4b",
	});
}
