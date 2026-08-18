import { describe, expect, it } from "vitest";

import {
	durationSeconds,
	formatDuration,
	readingMinutes,
} from "./reading-time.utils";

describe("readingMinutes", () => {
	it("rounds to whole minutes", () => {
		expect(readingMinutes(450, 225)).toBe(2);
	});

	it("floors at 1 minute for any non-empty text", () => {
		expect(readingMinutes(10, 225)).toBe(1);
	});

	it("returns 0 for empty text", () => {
		expect(readingMinutes(0, 225)).toBe(0);
		expect(readingMinutes(-5, 225)).toBe(0);
	});
});

describe("durationSeconds", () => {
	it("converts words to rounded seconds", () => {
		expect(durationSeconds(225, 225)).toBe(60);
		expect(durationSeconds(113, 225)).toBe(30);
	});

	it("returns 0 for empty text", () => {
		expect(durationSeconds(0, 225)).toBe(0);
	});
});

describe("formatDuration", () => {
	it.each([
		[0, "0 sec"],
		[-3, "0 sec"],
		[45, "45 sec"],
		[60, "1 min"],
		[125, "2 min 5 sec"],
	])("%i seconds → %j", (seconds, expected) => {
		expect(formatDuration(seconds)).toBe(expected);
	});
});
