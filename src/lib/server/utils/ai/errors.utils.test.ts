import { beforeEach, describe, expect, it, vi } from "vitest";

import { toUserMessage, type ToolErrorOptions } from "./errors.utils";

const OPTS: ToolErrorOptions = {
	logTag: "test-tool",
	perUserDaily: 10,
	fallback: "Something went wrong. Please try again.",
};

let logged: unknown[] = [];

beforeEach(() => {
	logged = [];
	vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
		logged.push(...args);
	});
});

describe("toUserMessage", () => {
	it("checks tool-specific rules before anything else", () => {
		const message = toUserMessage(new Error("ARTICLE_TOO_LONG"), {
			...OPTS,
			rules: [[/ARTICLE_TOO_LONG/, "Custom too-long copy."]],
		});
		expect(message).toBe("Custom too-long copy.");
	});

	it.each([
		["INVALID_INPUT", /refresh the page/i],
		["NO_SERVER_KEY", /add your own free google key/i],
		["QUOTA_UNAVAILABLE", /hosted allowance/i],
		["RATE_LIMIT_BURST", /wait a minute/i],
		["RATE_LIMIT_USER", /10 free generations/i],
		["RATE_LIMIT_POOL", /shared across everyone/i],
	])("maps the coded sentinel %s to its copy", (code, copy) => {
		expect(toUserMessage(new Error(code), OPTS)).toMatch(copy);
	});

	it("maps aborts and timeouts to a retry message", () => {
		const abort = new Error("The operation was aborted");
		abort.name = "AbortError";
		expect(toUserMessage(abort, OPTS)).toMatch(/took too long/i);
	});

	it("maps a 503/overload to Google-is-busy copy", () => {
		expect(toUserMessage(new Error("503 UNAVAILABLE"), OPTS)).toMatch(
			/busy right now/i,
		);
	});

	it("adapts Google-throttle advice to BYOK vs hosted", () => {
		const throttled = new Error("RESOURCE_EXHAUSTED");
		expect(toUserMessage(throttled, { ...OPTS, byok: true })).toMatch(
			/your google key/i,
		);
		expect(toUserMessage(throttled, OPTS)).toMatch(/lot of requests/i);
	});

	it("adapts rejected-key advice to BYOK vs hosted", () => {
		const rejected = new Error("API_KEY_INVALID");
		expect(toUserMessage(rejected, { ...OPTS, byok: true })).toMatch(
			/didn't accept your api key/i,
		);
		// On the hosted path a bad key is the operator's problem, not the user's.
		expect(toUserMessage(rejected, OPTS)).toMatch(/on our end/i);
	});

	it("falls back to the tool's fallback copy for unknown errors", () => {
		expect(toUserMessage(new Error("mystery"), OPTS)).toBe(OPTS.fallback);
	});

	it("never returns raw error text to the user", () => {
		const message = toUserMessage(
			new Error("ECONNREFUSED 10.0.0.5:6379 internal-hostname"),
			OPTS,
		);
		expect(message).toBe(OPTS.fallback);
		expect(message).not.toContain("10.0.0.5");
	});

	// The BYOK promise: a user's key never leaves their session — including into
	// our own logs via a provider error that embeds it.
	describe("log redaction", () => {
		const KEY = "AIzaSyFakeUserByokKey12345678901234567";

		it("redacts a bare Google-shaped key from logged messages", () => {
			toUserMessage(new Error(`401 invalid key ${KEY}`), OPTS);
			expect(JSON.stringify(logged)).not.toContain(KEY);
			expect(JSON.stringify(logged)).toContain("[redacted]");
		});

		it("redacts key-bearing query params from logged URLs", () => {
			const error = new Error("request failed") as Error & { url?: string };
			error.url = `https://generativelanguage.googleapis.com/v1?key=${KEY}`;
			toUserMessage(error, OPTS);
			const output = JSON.stringify(logged);
			expect(output).not.toContain(KEY);
			expect(output).toContain("key=[redacted]");
		});

		it("redacts keys inside a logged response body and truncates it", () => {
			const error = new Error("bad response") as Error & {
				responseBody?: string;
			};
			error.responseBody = `{"error":"api_key=${KEY}"}` + "x".repeat(1000);
			toUserMessage(error, OPTS);
			const output = JSON.stringify(logged);
			expect(output).not.toContain(KEY);
		});

		it("redacts keys from non-Error values", () => {
			toUserMessage(`string failure ?apikey=${KEY}&x=1`, OPTS);
			expect(JSON.stringify(logged)).not.toContain(KEY);
		});
	});
});
