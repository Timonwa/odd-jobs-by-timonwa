import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { parseActionInput } from "./action-input.utils";

const schema = z.object({ name: z.string().min(1).max(10) });

afterEach(() => {
	vi.restoreAllMocks();
});

describe("parseActionInput", () => {
	it("returns the parsed data for valid input", () => {
		expect(parseActionInput(schema, { name: "ok" })).toEqual({ name: "ok" });
	});

	it("strips unknown fields rather than passing them through", () => {
		expect(parseActionInput(schema, { name: "ok", extra: "x" })).toEqual({
			name: "ok",
		});
	});

	it.each([
		["oversized field", { name: "a".repeat(11) }],
		["wrong shape", { name: 42 }],
		["missing field", {}],
		["non-object", "raw string"],
		["null", null],
	])("throws for %s", (_label, input) => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => parseActionInput(schema, input)).toThrow("INVALID_INPUT");
	});

	// A Server Action is a POST endpoint — the thrown message must not teach a
	// probing caller anything about the schema or echo their payload.
	it("throws an opaque error that leaks no schema detail or input", () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		const secretPayload = { name: "attacker-probe-value-that-is-too-long" };
		try {
			parseActionInput(schema, secretPayload);
			expect.unreachable("should have thrown");
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			expect(message).toBe("INVALID_INPUT");
			expect(message).not.toContain("name");
			expect(message).not.toContain("attacker-probe");
		}
	});

	it("logs the Zod issues server-side only", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => parseActionInput(schema, {})).toThrow("INVALID_INPUT");
		expect(spy).toHaveBeenCalledWith(
			"[action-input] rejected",
			expect.any(Array),
		);
	});
});
