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

const TOOL_PATH = "/article-to-seo-meta";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Article to SEO Meta — titles & descriptions in spec";
const TOOL_DESCRIPTION =
	"Paste an article URL or text and get 1-3 SEO title and description variations sized to Google's limits (50-60 / 150-160 chars), each with your keyword.";

export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Article to SEO Meta",
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
	name: "Article to SEO Meta",
	alternateName: "SEO Meta Generator",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "BusinessApplication",
	applicationSubCategory: "SEO tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"SEO title generator",
		"SEO meta description generator",
		"meta description 160 characters",
		"SEO title 60 characters",
		"article to SEO",
		"URL to SEO meta tags",
		"primary keyword in title",
		"open source SEO tool",
	].join(", "),
	featureList: [
		"Generate 1-3 SEO title + description variations from an article URL or pasted text",
		"Strict character ranges: titles 50-60, descriptions 150-160",
		"Optional primary keyword included in every variation",
		"Per-field character counter with in-range, close, or out-of-range indicators",
		"Regenerate a single variation for a fresh angle",
		"Edit variations inline and copy title, description, or both in one click",
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

export default function ArticleToSeoMetaLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-article-to-seo-meta contents">
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
