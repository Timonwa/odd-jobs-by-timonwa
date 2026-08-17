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

const TOOL_PATH = "/lorem-ipsum";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Lorem Ipsum Generator — placeholder text in one click";
const TOOL_DESCRIPTION =
	"Generate lorem ipsum placeholder text by the paragraph, sentence, or word. Pick how much, regenerate for a fresh batch, and copy it into your mockup. Runs in your browser.";

/** Page metadata for the Lorem Ipsum Generator tool route. */
export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Lorem Ipsum Generator",
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
	name: "Lorem Ipsum Generator",
	alternateName: "Placeholder Text Generator",
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
		"lorem ipsum",
		"lorem ipsum generator",
		"placeholder text",
		"dummy text generator",
		"filler text",
		"lipsum",
		"open source lorem ipsum generator",
	].join(", "),
	featureList: [
		"Generate lorem ipsum by paragraph, sentence, or word",
		"Choose exactly how much text to produce",
		"Start with the classic “Lorem ipsum dolor sit amet…” or not",
		"Regenerate for a fresh batch",
		"One-click copy",
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

export default function LoremIpsumLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-lorem-ipsum contents">
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
