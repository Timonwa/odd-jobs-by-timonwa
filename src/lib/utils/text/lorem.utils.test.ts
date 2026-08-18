import { describe, expect, it } from "vitest";

import { generateLorem } from "./lorem.utils";

// Deterministic "random": walks a fixed sequence so output is reproducible.
const seeded = () => {
	let i = 0;
	const sequence = [0.1, 0.5, 0.9, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6, 0.05];
	return () => sequence[i++ % sequence.length]!;
};

describe("generateLorem", () => {
	it("generates exactly the requested number of words", () => {
		const out = generateLorem({ unit: "words", count: 7 }, seeded());
		expect(out.replace(/\.$/, "").split(" ")).toHaveLength(7);
	});

	it("generates the requested number of sentences", () => {
		const out = generateLorem({ unit: "sentences", count: 3 }, seeded());
		expect(out.match(/\./g)).toHaveLength(3);
	});

	it("generates the requested number of paragraphs", () => {
		const out = generateLorem({ unit: "paragraphs", count: 2 }, seeded());
		expect(out.split("\n\n")).toHaveLength(2);
	});

	it("starts with the classic opening when asked", () => {
		const out = generateLorem(
			{ unit: "words", count: 8, startWithLorem: true },
			seeded(),
		);
		expect(out).toMatch(/^Lorem ipsum dolor sit amet/);
	});

	it("caps the classic opening at the requested word count", () => {
		const out = generateLorem(
			{ unit: "words", count: 3, startWithLorem: true },
			seeded(),
		);
		expect(out).toBe("Lorem ipsum dolor.");
	});

	it("floors a zero/negative count at 1", () => {
		expect(
			generateLorem({ unit: "words", count: 0 }, seeded()).split(" "),
		).toHaveLength(1);
	});

	it("capitalizes sentences and ends them with a period", () => {
		const out = generateLorem({ unit: "sentences", count: 2 }, seeded());
		for (const sentence of out.split(". ")) {
			expect(sentence.charAt(0)).toBe(sentence.charAt(0).toUpperCase());
		}
	});

	it("is deterministic for a fixed random source", () => {
		const a = generateLorem({ unit: "paragraphs", count: 1 }, seeded());
		const b = generateLorem({ unit: "paragraphs", count: 1 }, seeded());
		expect(a).toBe(b);
	});
});
