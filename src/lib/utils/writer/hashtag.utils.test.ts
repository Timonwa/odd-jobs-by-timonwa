import { describe, expect, it } from "vitest";

import { normalizeHashtag } from "./hashtag.utils";

describe("normalizeHashtag", () => {
	it.each([
		["#WebDev", "WebDev"],
		["##double", "double"],
		["  #spaced  ", "spaced"],
		["type-script_4", "type-script_4"],
		["emoji🎉tag", "emojitag"],
		["dev tools", "devtools"],
	])("normalizes %j to %j", (input, expected) => {
		expect(normalizeHashtag(input)).toBe(expected);
	});

	it.each(["", "   ", "###", "🎉🎉"])(
		"returns empty string for unusable input %j",
		(input) => {
			expect(normalizeHashtag(input)).toBe("");
		},
	);

	it("caps the result at 40 characters", () => {
		expect(normalizeHashtag("a".repeat(60))).toHaveLength(40);
	});
});
