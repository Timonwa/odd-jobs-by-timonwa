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

const TOOL_PATH = "/word-counter";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Word & Character Counter — reading time & limits";
const TOOL_DESCRIPTION =
	"Count words, characters, sentences, and paragraphs as you type, with reading time and live limits for SEO titles, meta descriptions, and social posts.";

/** Route metadata for the Word & Character Counter tool. */
export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Word & Character Counter",
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
	name: "Word & Character Counter",
	alternateName: "Word Counter",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "UtilitiesApplication",
	applicationSubCategory: "Text tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"word counter",
		"character counter",
		"count words online",
		"meta description character count",
		"tweet character count",
		"reading time calculator",
		"open source word counter",
	].join(", "),
	featureList: [
		"Live word, character, sentence, paragraph, and line counts",
		"Reading and speaking time estimates",
		"Live character limits for SEO titles, meta descriptions, X, Bluesky, and LinkedIn",
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

/** Layout wrapper for the Word & Character Counter route — applies tool brand scope and injects JSON-LD. */
export default function WordCounterLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-word-counter contents">
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
