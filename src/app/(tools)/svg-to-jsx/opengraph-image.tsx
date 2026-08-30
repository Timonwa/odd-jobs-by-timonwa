import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";

export const alt = "SVG to JSX Converter — turn raw SVG into a React component";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: `SVG to JSX · ${siteConfig.name}`,
		titleLead: "SVG to",
		titleAccent: "JSX",
		subtitle:
			"Paste raw SVG, get clean JSX — React-named attributes, style objects, and an optional typed component.",
		pills: ["React / JSX", "camelCase attrs", "One-click copy"],
		...OG_PALETTES.fuchsia,
	});
}
