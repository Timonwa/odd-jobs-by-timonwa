import { describe, expect, it } from "vitest";

import { assertToolSlug, parseToolFaq } from "./tool-content.utils";

describe("assertToolSlug", () => {
	it("returns a slug that exists in the TOOLS registry", () => {
		expect(assertToolSlug("word-counter")).toBe("word-counter");
	});

	// The slug is interpolated into a dynamic import path — anything not in the
	// registry must never reach it.
	it.each([
		"unknown-tool",
		"../secrets",
		"..%2F..%2Fetc",
		"word-counter/../blog",
		"",
	])("throws for unregistered or path-shaped slug %j", (slug) => {
		expect(() => assertToolSlug(slug)).toThrow(/No tool registered/);
	});
});

describe("parseToolFaq", () => {
	it("returns a valid FAQ list", () => {
		const faq = [{ question: "What is this?", answer: "A tool." }];
		expect(parseToolFaq("word-counter", faq)).toEqual(faq);
	});

	it.each([
		["empty array", []],
		["missing answer", [{ question: "Q" }]],
		["empty strings", [{ question: "", answer: "" }]],
		["not an array", { question: "Q", answer: "A" }],
		["undefined export", undefined],
	])("throws for %s — malformed FAQ must not become JSON-LD", (_label, faq) => {
		expect(() => parseToolFaq("word-counter", faq)).toThrow(/Invalid `faq`/);
	});
});
