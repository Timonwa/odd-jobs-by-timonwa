import { describe, expect, it } from "vitest";

import {
	INDEXED_SEO,
	INDEXED_SEO_PATHS,
	splitHeading,
	type IndexedSeoKey,
} from "./page-seo";

const KEYS = Object.keys(INDEXED_SEO) as IndexedSeoKey[];

describe("INDEXED_SEO", () => {
	it("covers every page that has a path", () => {
		expect(KEYS.sort()).toEqual(Object.keys(INDEXED_SEO_PATHS).sort());
	});
});

describe("splitHeading", () => {
	it("spaces a word trail and butts a punctuation trail", () => {
		expect(
			splitHeading({ lead: "The", accent: "odd jobs", trail: "in code" }),
		).toEqual({ lead: "The ", accent: "odd jobs", trail: " in code" });
		expect(
			splitHeading({ lead: "Every", accent: "odd job", trail: ", one place" }),
		).toEqual({ lead: "Every ", accent: "odd job", trail: ", one place" });
	});

	it("returns an empty trail when there is none", () => {
		expect(splitHeading({ lead: "Browse by", accent: "category" })).toEqual({
			lead: "Browse by ",
			accent: "category",
			trail: "",
		});
	});
});
