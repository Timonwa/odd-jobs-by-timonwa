import { describe, expect, it } from "vitest";

import { SITE_URL } from "@/lib/config/site";

import {
	buildItemListJsonLd,
	buildSiteGraphJsonLd,
	JSON_LD_IDS,
	ogImageUrl,
} from "./json-ld.utils";

describe("buildSiteGraphJsonLd", () => {
	it("emits one Organization and one WebSite under stable @ids", () => {
		const graph = buildSiteGraphJsonLd()["@graph"] as Record<string, unknown>[];
		expect(graph.map((node) => node["@type"])).toEqual([
			"Organization",
			"WebSite",
		]);
		expect(graph[0]?.["@id"]).toBe(JSON_LD_IDS.organization);
		expect(graph[1]?.["@id"]).toBe(JSON_LD_IDS.website);
		// The WebSite references the Organization instead of re-describing it.
		expect(graph[1]?.publisher).toEqual({ "@id": JSON_LD_IDS.organization });
	});
});

describe("buildItemListJsonLd", () => {
	it("orders items 1-based with absolute URLs", () => {
		const list = buildItemListJsonLd("Blog", [
			{ href: "/blog/a" as never, title: "A" },
			{ href: "/blog/b" as never, title: "B" },
		]);
		expect(list.itemListElement).toEqual([
			{
				"@type": "ListItem",
				position: 1,
				url: `${SITE_URL}/blog/a`,
				name: "A",
			},
			{
				"@type": "ListItem",
				position: 2,
				url: `${SITE_URL}/blog/b`,
				name: "B",
			},
		]);
	});
});

describe("ogImageUrl", () => {
	it("appends the opengraph-image segment to an absolute route", () => {
		expect(ogImageUrl("/blog/a" as never)).toBe(
			`${SITE_URL}/blog/a/opengraph-image`,
		);
	});
});
