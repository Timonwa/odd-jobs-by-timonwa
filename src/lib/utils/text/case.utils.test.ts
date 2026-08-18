import { describe, expect, it } from "vitest";

import { CASE_GROUPS, convertCase } from "./case.utils";

describe("convertCase", () => {
	it.each([
		["camel", "hello world example", "helloWorldExample"],
		["pascal", "hello world example", "HelloWorldExample"],
		["snake", "Hello World", "hello_world"],
		["kebab", "Hello World", "hello-world"],
		["constant", "hello world", "HELLO_WORLD"],
		["dot", "Hello World", "hello.world"],
		["path", "Hello World", "hello/world"],
		["train", "hello world", "Hello-World"],
		["upper", "Hello", "HELLO"],
		["lower", "HeLLo", "hello"],
	] as const)("%s: %j → %j", (id, input, expected) => {
		expect(convertCase(input, id)).toBe(expected);
	});

	it("tokenizes camelCase and delimiter boundaries for programmer cases", () => {
		expect(convertCase("myVariable-name_here.now", "snake")).toBe(
			"my_variable_name_here_now",
		);
	});

	it("sentence-cases after terminal punctuation", () => {
		expect(convertCase("hello world. GOODBYE world! ok?", "sentence")).toBe(
			"Hello world. Goodbye world! Ok?",
		);
	});

	it("start-cases every word", () => {
		expect(convertCase("hello wonderful world", "start")).toBe(
			"Hello Wonderful World",
		);
	});

	describe("title cases", () => {
		it("AP lowercases short prepositions but capitalizes 4+ letter ones", () => {
			expect(convertCase("a walk through the park at dawn", "title-ap")).toBe(
				"A Walk Through the Park at Dawn",
			);
		});

		it("Chicago lowercases prepositions of any length", () => {
			expect(
				convertCase("a walk through the park at dawn", "title-chicago"),
			).toBe("A Walk through the Park at Dawn");
		});

		it("APA capitalizes any word of 4+ letters", () => {
			expect(convertCase("living with the machines", "title-apa")).toBe(
				"Living With the Machines",
			);
		});

		it("always capitalizes the first and (AP/Chicago) last word", () => {
			expect(convertCase("the thing to look at", "title-ap")).toBe(
				"The Thing to Look At",
			);
		});
	});

	it("alternates case letter by letter, skipping non-letters", () => {
		expect(convertCase("abcd ef", "alternating")).toBe("aBcD eF");
	});

	it("inverts existing case", () => {
		expect(convertCase("Hello World", "inverse")).toBe("hELLO wORLD");
	});

	it.each(CASE_GROUPS.flatMap((g) => g.cases.map((c) => c.id)))(
		"every registered case id (%s) transforms without throwing",
		(id) => {
			expect(() => convertCase("Sample input-text", id)).not.toThrow();
		},
	);

	it("returns empty output for empty input in tokenized cases", () => {
		expect(convertCase("", "camel")).toBe("");
		expect(convertCase("   ", "kebab")).toBe("");
	});
});
