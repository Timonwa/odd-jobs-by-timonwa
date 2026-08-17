import type { Metadata } from "next";

import {
	CREATOR_NAME,
	CREATOR_SAME_AS,
	CREATOR_TWITTER,
	CREATOR_URL,
	REPO_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";

const TOOL_PATH = "/hash-generator";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Hash Generator — SHA-1, SHA-256, SHA-384, SHA-512";
const TOOL_DESCRIPTION =
	"Hash text with SHA-1, SHA-256, SHA-384, and SHA-512 instantly. Computed locally with the Web Crypto API — your text never leaves the browser.";

export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Hash Generator",
	alternates: { canonical: TOOL_PATH },
	openGraph: {
		type: "website",
		url: TOOL_URL,
		siteName: SITE_NAME,
		title: TOOL_TITLE,
		description: TOOL_DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		site: CREATOR_TWITTER,
		creator: CREATOR_TWITTER,
		title: TOOL_TITLE,
		description: TOOL_DESCRIPTION,
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	name: "Hash Generator",
	alternateName: "SHA Hash Generator",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "DeveloperApplication",
	applicationSubCategory: "Developer tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"hash generator",
		"sha256 generator",
		"sha-256 hash",
		"sha1 generator",
		"sha512 generator",
		"online hash tool",
		"open source hash generator",
	].join(", "),
	featureList: [
		"Hash text with SHA-1, SHA-256, SHA-384, and SHA-512",
		"Digests update as you type",
		"Lowercase or uppercase hex output",
		"One-click copy for each hash",
		"Computed locally with the Web Crypto API — nothing is uploaded",
		"Open source",
	],
	creator: {
		"@type": "Person",
		name: CREATOR_NAME,
		url: CREATOR_URL,
		sameAs: CREATOR_SAME_AS,
	},
	sameAs: [REPO_URL],
};

export default function HashGeneratorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-hash-generator contents">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
				}}
			/>
			{children}
		</div>
	);
}
