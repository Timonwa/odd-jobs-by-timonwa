import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";

export const alt =
	"Case Converter — UPPERCASE, Title Case, camelCase, snake_case, and more";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: `Case converter · ${siteConfig.name}`,
		titleLead: "Case",
		titleAccent: "Converter",
		subtitle:
			"Switch text between UPPERCASE, Title Case, camelCase, snake_case, and more — then copy.",
		pills: ["17 cases", "Live preview", "One-click copy"],
		...OG_PALETTES.rose,
	});
}
