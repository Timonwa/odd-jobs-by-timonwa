// Builders for the structured data the content sections emit. Keeping the shape
// in one place stops three near-identical `ItemList` literals from drifting.

import type { Route } from "next";

import {
	CREATOR_NAME,
	CREATOR_SAME_AS,
	CREATOR_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";

/** Stable `@id`s so every block on the site references one Organization and one WebSite instead of re-describing them. Fragment URIs, per schema.org convention. */
export const JSON_LD_IDS = {
	organization: `${SITE_URL}/#organization`,
	website: `${SITE_URL}/#website`,
} as const;

/** The site-level graph: who publishes this and what the site is. Rendered once on the home page; everything else points at these `@id`s. */
export function buildSiteGraphJsonLd(): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": JSON_LD_IDS.organization,
				name: SITE_NAME,
				// Teaches search engines that the pre-rebrand name is the same entity.
				alternateName: "Tools by Timonwa",
				url: SITE_URL,
				description: SITE_DESCRIPTION,
				founder: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
				sameAs: CREATOR_SAME_AS,
			},
			{
				"@type": "WebSite",
				"@id": JSON_LD_IDS.website,
				name: SITE_NAME,
				url: SITE_URL,
				description: SITE_DESCRIPTION,
				publisher: { "@id": JSON_LD_IDS.organization },
				inLanguage: "en",
			},
		],
	};
}

/** An `ItemList` for a section index (blog, newsletter, shop) — ordered links to the section's entries. */
export function buildItemListJsonLd(
	sectionName: string,
	items: { href: Route; title: string }[],
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `${sectionName} — ${SITE_NAME}`,
		isPartOf: { "@id": JSON_LD_IDS.website },
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: `${SITE_URL}${item.href}`,
			name: item.title,
		})),
	};
}

/** Absolute URL of a route's generated OpenGraph card — the `/opengraph-image` suffix lives here rather than being concatenated at each JSON-LD site. */
export function ogImageUrl(path: Route): string {
	return `${SITE_URL}${path}/opengraph-image`;
}
