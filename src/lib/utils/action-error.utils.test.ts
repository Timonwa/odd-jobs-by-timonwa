import { beforeEach, describe, expect, it, vi } from "vitest";

import { toActionCallErrorMessage } from "./action-error.utils";

beforeEach(() => {
	vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("toActionCallErrorMessage", () => {
	it("maps a payload-size rejection to the shorten-it message", () => {
		expect(
			toActionCallErrorMessage(new Error("Body exceeded 1mb limit"), "test"),
		).toMatch(/too large to send/i);
		expect(toActionCallErrorMessage(new Error("413"), "test")).toMatch(
			/too large to send/i,
		);
	});

	it("maps a fetch TypeError to the offline message", () => {
		expect(
			toActionCallErrorMessage(new TypeError("Failed to fetch"), "test"),
		).toMatch(/couldn't reach the server/i);
	});

	it("falls back to a generic message for unknown errors", () => {
		const message = toActionCallErrorMessage(
			new Error("some internal detail"),
			"test",
		);
		expect(message).toMatch(/something went wrong/i);
		// The real error is logged, never shown.
		expect(message).not.toContain("internal detail");
	});

	it("logs the original error under the call-site tag", () => {
		const error = new Error("boom");
		toActionCallErrorMessage(error, "seo-meta");
		expect(console.error).toHaveBeenCalledWith("[seo-meta]", error);
	});
});
