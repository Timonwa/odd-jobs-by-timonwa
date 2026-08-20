import { describe, expect, it } from "vitest";

import { countWords, getTextCounts } from "./counts.utils";

describe("countWords", () => {
	it("counts whitespace-separated words", () => {
		expect(countWords("one two  three\nfour")).toBe(4);
	});

	it.each(["", "   ", "\n\t"])("returns 0 for blank input %j", (input) => {
		expect(countWords(input)).toBe(0);
	});
});

describe("getTextCounts", () => {
	it("aggregates all metrics", () => {
		const text = "Hello world. How are you?\n\nSecond paragraph here!";
		const counts = getTextCounts(text);
		expect(counts.words).toBe(8);
		expect(counts.sentences).toBe(3);
		expect(counts.paragraphs).toBe(2);
		expect(counts.lines).toBe(3);
	});

	it("counts characters by code point, not UTF-16 units", () => {
		const counts = getTextCounts("a😀b");
		expect(counts.characters).toBe(3);
	});

	it("excludes all whitespace from charactersNoSpaces", () => {
		expect(getTextCounts("a b\tc\nd").charactersNoSpaces).toBe(4);
	});

	it("handles empty input", () => {
		expect(getTextCounts("")).toEqual({
			characters: 0,
			charactersNoSpaces: 0,
			words: 0,
			sentences: 0,
			paragraphs: 0,
			lines: 0,
		});
	});

	it("counts CRLF and lone CR line endings", () => {
		expect(getTextCounts("a\r\nb\rc").lines).toBe(3);
	});
});
