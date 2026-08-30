import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";

export const alt = "Hash Generator — SHA-1, SHA-256, SHA-384, and SHA-512";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: `Hash generator · ${siteConfig.name}`,
		titleLead: "Hash",
		titleAccent: "Generator",
		subtitle:
			"SHA-1, SHA-256, SHA-384, and SHA-512 digests as you type — computed locally with the Web Crypto API.",
		pills: ["SHA-256", "SHA-512", "In your browser"],
		...OG_PALETTES.rose,
	});
}
