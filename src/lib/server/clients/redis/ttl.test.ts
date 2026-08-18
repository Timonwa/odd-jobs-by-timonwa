import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	BURST_WINDOW_SECONDS,
	currentBurstWindow,
	secondsUntilUtcMidnight,
	todayUtc,
} from "./ttl";

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("secondsUntilUtcMidnight", () => {
	it("returns the seconds left in the UTC day", () => {
		vi.setSystemTime(new Date("2026-08-18T22:00:00.000Z"));
		expect(secondsUntilUtcMidnight()).toBe(2 * 60 * 60);
	});

	it("floors at 60 right before the boundary so the key outlives its request", () => {
		vi.setSystemTime(new Date("2026-08-18T23:59:59.500Z"));
		expect(secondsUntilUtcMidnight()).toBe(60);
	});

	it("returns a full day at UTC midnight", () => {
		vi.setSystemTime(new Date("2026-08-18T00:00:00.000Z"));
		expect(secondsUntilUtcMidnight()).toBe(24 * 60 * 60);
	});
});

describe("todayUtc", () => {
	it("formats the current UTC date as YYYY-MM-DD", () => {
		vi.setSystemTime(new Date("2026-08-18T10:00:00.000Z"));
		expect(todayUtc()).toBe("2026-08-18");
	});

	it("rolls the date at UTC midnight, not local midnight", () => {
		vi.setSystemTime(new Date("2026-08-18T23:59:59.999Z"));
		expect(todayUtc()).toBe("2026-08-18");
		vi.setSystemTime(new Date("2026-08-19T00:00:00.000Z"));
		expect(todayUtc()).toBe("2026-08-19");
	});
});

describe("currentBurstWindow", () => {
	it("returns the same boundary within one window", () => {
		vi.setSystemTime(new Date("2026-08-18T10:00:05.000Z"));
		const first = currentBurstWindow();
		vi.setSystemTime(new Date("2026-08-18T10:00:55.000Z"));
		expect(currentBurstWindow()).toBe(first);
	});

	it("advances at the window boundary", () => {
		vi.setSystemTime(new Date("2026-08-18T10:00:59.999Z"));
		const first = currentBurstWindow();
		vi.setSystemTime(new Date("2026-08-18T10:01:00.000Z"));
		expect(currentBurstWindow()).toBe(first + 1);
	});

	it("windows are BURST_WINDOW_SECONDS long", () => {
		vi.setSystemTime(new Date("2026-08-18T00:00:00.000Z"));
		const first = currentBurstWindow();
		vi.setSystemTime(
			new Date(
				Date.parse("2026-08-18T00:00:00.000Z") + BURST_WINDOW_SECONDS * 1000,
			),
		);
		expect(currentBurstWindow()).toBe(first + 1);
	});
});
