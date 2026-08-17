import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
export const alt = "Newsletter — The Productivity Bug";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Newsletter · The Productivity Bug",
		titleLead: "Productivity, in your",
		titleAccent: "inbox",
		subtitle:
			"New tools, posts, and productivity notes — the occasional issue, no spam.",
		pills: ["Tools", "Posts", "Notes"],
		accent: "#818cf8",
		backgroundTint: "#1e1b4b",
	});
}
