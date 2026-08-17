import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og/og-image";

export const runtime = "edge";
export const alt = "Blog — The Productivity Bug";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Blog · The Productivity Bug",
		titleLead: "Getting things done,",
		titleAccent: "made simpler",
		subtitle:
			"Practical tips, systems, and ideas on productivity and workflow — to help you get more done.",
		pills: ["Productivity", "Workflow", "Tips"],
		accent: "#818cf8",
		backgroundTint: "#1e1b4b",
	});
}
