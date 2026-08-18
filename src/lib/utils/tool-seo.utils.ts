// Builds a tool route's metadata and WebApplication JSON-LD from one registry
// entry, so the nine tool layouts stay thin and can't drift from each other.

import type { Metadata } from "next";

import { ROUTES } from "@/lib/config/routes";
import {
	CREATOR_NAME,
	CREATOR_SAME_AS,
	CREATOR_TWITTER,
	CREATOR_URL,
	REPO_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";
import { TOOL_SEO } from "@/lib/data";

function getToolSeo(slug: string) {
	const seo = TOOL_SEO[slug];
	if (!seo) throw new Error(`No TOOL_SEO entry for "${slug}"`);
	return seo;
}

/** Route metadata for a tool page — canonical, OpenGraph, and Twitter card, all from the tool's registry copy. */
export function buildToolMetadata(slug: string): Metadata {
	const seo = getToolSeo(slug);
	const path = ROUTES.tool(slug);
	return {
		title: seo.title,
		description: seo.description,
		applicationName: seo.applicationName,
		alternates: { canonical: path },
		openGraph: {
			type: "website",
			url: `${SITE_URL}${path}`,
			siteName: SITE_NAME,
			title: seo.title,
			description: seo.description,
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			site: CREATOR_TWITTER,
			creator: CREATOR_TWITTER,
			title: seo.title,
			description: seo.description,
		},
	};
}

/** `WebApplication` JSON-LD for a tool page. The shape is identical across tools; only the registry copy differs. */
export function buildToolJsonLd(slug: string): Record<string, unknown> {
	const seo = getToolSeo(slug);
	return {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: seo.applicationName,
		...(seo.alternateName && { alternateName: seo.alternateName }),
		url: `${SITE_URL}${ROUTES.tool(slug)}`,
		description: seo.description,
		applicationCategory: "UtilitiesApplication",
		applicationSubCategory: seo.applicationSubCategory,
		operatingSystem: "Any",
		browserRequirements: "Requires JavaScript. Requires a modern browser.",
		offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
		isAccessibleForFree: true,
		inLanguage: "en",
		keywords: seo.keywords.join(", "),
		featureList: seo.featureList,
		creator: {
			"@type": "Person",
			name: CREATOR_NAME,
			url: CREATOR_URL,
			sameAs: CREATOR_SAME_AS,
		},
		sameAs: [REPO_URL],
	};
}
