import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { timeAgo } from "./time.utils";

const NOW = Date.parse("2026-08-18T12:00:00.000Z");

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(NOW);
});

afterEach(() => {
	vi.useRealTimers();
});

describe("timeAgo", () => {
	it.each([
		[10 * 1000, "just now"],
		[5 * 60 * 1000, "5m ago"],
		[59 * 60 * 1000 - 25000, "59m ago"],
		[2 * 60 * 60 * 1000, "2h ago"],
		[3 * 24 * 60 * 60 * 1000, "3d ago"],
	])("formats a %ims-old timestamp as %j", (age, expected) => {
		expect(timeAgo(NOW - age)).toBe(expected);
	});
});
