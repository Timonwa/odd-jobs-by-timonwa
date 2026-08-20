// Builds a tool route's metadata and WebApplication JSON-LD from one registry
// entry, so the nine tool layouts stay thin and can't drift from each other.

import type { Metadata } from "next";

import { ROUTES } from "@/lib/config/routes";
import { TOOL_SEO, type ToolSeo } from "@/lib/data";
import { siteConfig } from "@/lib/config/site";
import { EXTERNAL_ROUTES } from "@/lib/config/routes";

function getToolSeo(slug: string): ToolSeo {
	const seo: ToolSeo | undefined = TOOL_SEO[slug as keyof typeof TOOL_SEO];
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
			url: `${siteConfig.url}${path}`,
			siteName: siteConfig.name,
			title: seo.title,
			description: seo.description,
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			site: siteConfig.twitter,
			creator: siteConfig.twitter,
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
		url: `${siteConfig.url}${ROUTES.tool(slug)}`,
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
			name: siteConfig.creator.name,
			url: siteConfig.creator.url,
			sameAs: siteConfig.creator.sameAs,
		},
		sameAs: [EXTERNAL_ROUTES.repo],
	};
}
