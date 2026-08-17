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

const TOOL_PATH = "/slug-generator";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Slug Generator — turn any text into a clean URL slug";
const TOOL_DESCRIPTION =
	"Turn any title or heading into a clean, URL-safe slug — strips accents and punctuation, with separator, lowercase, and stop-word options. Runs in your browser.";

/** Route metadata for the Slug Generator tool. */
export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Slug Generator",
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
	name: "Slug Generator",
	alternateName: "URL Slug Generator",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "UtilitiesApplication",
	applicationSubCategory: "SEO tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"slug generator",
		"url slug generator",
		"title to slug",
		"text to slug",
		"seo slug",
		"permalink generator",
		"open source slug generator",
	].join(", "),
	featureList: [
		"Turn any title, heading, or text into a clean, URL-safe slug",
		"Strips accents and punctuation",
		"Choose a hyphen or underscore separator",
		"Optional lowercasing and stop-word removal",
		"One-click copy, live preview",
		"Runs entirely in your browser — nothing is uploaded",
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

/** Layout wrapper for the Slug Generator route — applies tool brand scope and injects JSON-LD. */
export default function SlugGeneratorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-slug-generator contents">
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
