import { describe, expect, it } from "vitest";

import { sanitizeComponentName } from "./component-name.utils";

describe("sanitizeComponentName", () => {
	it.each([
		["my icon", "Myicon"],
		["arrow-right", "Arrowright"],
		["alreadyPascal", "AlreadyPascal"],
		["24-hours", "Icon24hours"],
		["<script>", "Script"],
	])("coerces %j to %j", (input, expected) => {
		expect(sanitizeComponentName(input)).toBe(expected);
	});

	it.each(["", "!!!", "🎉"])(
		"returns empty string for unusable input %j",
		(input) => {
			expect(sanitizeComponentName(input)).toBe("");
		},
	);
});
