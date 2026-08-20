import "server-only";

import type { ZodType } from "zod";

/**
 * Validate a Server Action's arguments before anything else runs.
 *
 * A Server Action is a POST endpoint, so its TypeScript signature guarantees
 * nothing at runtime: a hand-made call can send any shape. Parsing first is what
 * keeps an unbounded field from reaching the prompt — the daily quota counts
 * requests, not tokens, so a single allowed request could otherwise carry
 * megabytes to Gemini on the platform key.
 *
 * Throws the coded `INVALID_INPUT` rather than Zod's error, so nothing about the
 * schema's shape or the caller's payload reaches the response.
 */
export function parseActionInput<T>(schema: ZodType<T>, input: unknown): T {
	const parsed = schema.safeParse(input);
	if (!parsed.success) {
		// Logged server-side only — the issue list names fields and lengths, which
		// is useful to us and a probing aid to a caller.
		console.error("[action-input] rejected", parsed.error.issues);
		throw new Error("INVALID_INPUT");
	}
	return parsed.data;
}
