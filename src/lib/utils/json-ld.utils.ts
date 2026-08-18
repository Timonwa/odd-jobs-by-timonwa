// Builders for the structured data the content sections emit. Keeping the shape
// in one place stops three near-identical `ItemList` literals from drifting.

import type { Route } from "next";

import { SITE_NAME, SITE_URL } from "@/lib/config/site";

/** An `ItemList` for a section index (blog, newsletter, shop) — ordered links to the section's entries. */
export function buildItemListJsonLd(
	sectionName: string,
	items: { href: Route; title: string }[],
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `${sectionName} — ${SITE_NAME}`,
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
