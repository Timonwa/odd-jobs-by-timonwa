import { describe, expect, it } from "vitest";

import { SITE_URL } from "@/lib/config/site";
import { TOOLS } from "@/lib/config/tools";
import { TOOL_SEO } from "@/lib/data";

import { buildToolJsonLd, buildToolMetadata } from "./tool-seo.utils";

describe("buildToolMetadata", () => {
	it("builds canonical, OG, and Twitter metadata from the registry copy", () => {
		const metadata = buildToolMetadata("word-counter");
		const seo = TOOL_SEO["word-counter"]!;
		expect(metadata.title).toBe(seo.title);
		expect(metadata.alternates?.canonical).toBe("/word-counter");
		expect(metadata.openGraph?.url).toBe(`${SITE_URL}/word-counter`);
		expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
	});

	it("throws for a slug with no SEO entry", () => {
		expect(() => buildToolMetadata("unknown-tool")).toThrow(/No TOOL_SEO/);
	});

	// Registry drift check: every live tool must have SEO copy, so a new tool
	// can't ship with a missing entry blowing up at request time.
	it("has a TOOL_SEO entry for every registered tool", () => {
		for (const tool of TOOLS.filter((t) => t.status !== "soon")) {
			expect(TOOL_SEO[tool.slug], tool.slug).toBeDefined();
		}
	});
});

describe("buildToolJsonLd", () => {
	it("builds a free WebApplication block with an absolute URL", () => {
		const jsonLd = buildToolJsonLd("word-counter");
		expect(jsonLd).toMatchObject({
			"@type": "WebApplication",
			url: `${SITE_URL}/word-counter`,
			isAccessibleForFree: true,
			offers: { "@type": "Offer", price: "0" },
		});
	});
});
