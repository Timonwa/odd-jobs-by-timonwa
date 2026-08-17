import { SITE_NAME } from "@/lib/config/site";
import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

export const runtime = "edge";
export const alt = `${SITE_NAME} — Free, focused tools for writers, developers, and creators`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "The Productivity Bug · Free · Open source",
		titleLead: "Free tools that",
		titleAccent: "get it done",
		subtitle:
			"Free, focused tools that knock out the tedious parts of writing and code. No sign-up.",
		pills: ["Free", "No sign-up", "Open source"],
		accent: "#818cf8",
		backgroundTint: "#1e1b4b",
	});
}
