import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

export const runtime = "edge";
export const alt = "Hash Generator — SHA-1, SHA-256, SHA-384, and SHA-512";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
	return renderOgImage({
		eyebrow: "Hash generator · Open source",
		titleLead: "Hash",
		titleAccent: "Generator",
		subtitle:
			"SHA-1, SHA-256, SHA-384, and SHA-512 digests as you type — computed locally with the Web Crypto API.",
		pills: ["SHA-256", "SHA-512", "In your browser"],
		accent: "#fb7185",
		backgroundTint: "#4c0519",
	});
}
