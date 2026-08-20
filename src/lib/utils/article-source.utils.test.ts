import { describe, expect, it } from "vitest";

import { articleSourceIdentity, isArticleSource } from "./article-source.utils";

describe("articleSourceIdentity", () => {
	it("trims URLs so the same link dedupes regardless of whitespace", () => {
		expect(articleSourceIdentity({ kind: "url", url: " https://a.com " })).toBe(
			articleSourceIdentity({ kind: "url", url: "https://a.com" }),
		);
	});

	it("distinguishes a URL from identical pasted text", () => {
		expect(
			articleSourceIdentity({ kind: "url", url: "https://a.com" }),
		).not.toBe(articleSourceIdentity({ kind: "text", text: "https://a.com" }));
	});
});

describe("isArticleSource", () => {
	it.each([
		[{ kind: "url", url: "https://a.com" }, true],
		[{ kind: "text", text: "hello" }, true],
		[{ kind: "nope" }, false],
		[null, false],
		["url", false],
		[42, false],
	])("guards %j → %s", (value, expected) => {
		expect(isArticleSource(value)).toBe(expected);
	});
});
