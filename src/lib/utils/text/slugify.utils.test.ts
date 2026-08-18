import { describe, expect, it } from "vitest";

import { slugify } from "./slugify.utils";

describe("slugify", () => {
	it("lowercases and joins words with hyphens by default", () => {
		expect(slugify("Hello World Example")).toBe("hello-world-example");
	});

	it("strips punctuation and symbols", () => {
		expect(slugify("What's New?! (2026 Edition)")).toBe(
			"what-s-new-2026-edition",
		);
	});

	it("strips diacritics", () => {
		expect(slugify("Café déjà vu")).toBe("cafe-deja-vu");
	});

	it("supports underscore as separator", () => {
		expect(slugify("Hello World", { separator: "_" })).toBe("hello_world");
	});

	it("preserves case when lowercase is off", () => {
		expect(slugify("Hello World", { lowercase: false })).toBe("Hello-World");
	});

	it("removes stop words when asked", () => {
		expect(
			slugify("A Guide to the Best of TypeScript", { removeStopWords: true }),
		).toBe("guide-best-typescript");
	});

	it("keeps stop words when removing them would leave an empty slug", () => {
		expect(slugify("The And Of", { removeStopWords: true })).toBe("the-and-of");
	});

	it("returns empty string for input with nothing usable", () => {
		expect(slugify("!!! ***")).toBe("");
	});
});
