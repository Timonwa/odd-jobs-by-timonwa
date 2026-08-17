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

const TOOL_PATH = "/case-converter";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Case Converter — UPPERCASE, camelCase & 15 more";
const TOOL_DESCRIPTION =
	"Convert text between UPPERCASE, Title Case, camelCase, snake_case, kebab-case, and more — instantly, with one-click copy. Runs entirely in your browser.";

export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Case Converter",
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
	name: "Case Converter",
	alternateName: "Text Case Converter",
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
		"case converter",
		"uppercase to lowercase",
		"title case converter",
		"camelCase converter",
		"snake_case converter",
		"sentence case",
		"open source case converter",
	].join(", "),
	featureList: [
		"Convert to UPPERCASE, lowercase, Title Case, and Sentence case",
		"Programmer cases: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case",
		"Alternating and inverse case",
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

export default function CaseConverterLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-case-converter contents">
			<script
				type="application/ld+json"
				// JSON-LD structured data per Next.js docs
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
				}}
			/>
			{children}
		</div>
	);
}
