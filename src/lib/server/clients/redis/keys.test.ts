import { describe, expect, it } from "vitest";

import { REDIS_KEYS } from "./keys";

// APP_ENV is unset in tests, so the env schema defaults the tier to "development".
const TIER = "development";

describe("REDIS_KEYS", () => {
	it("builds the per-user daily key with the tier scope", () => {
		expect(REDIS_KEYS.quotaUserDaily("seo-meta", "abc123", "2026-08-18")).toBe(
			`rl:${TIER}:seo-meta:user:abc123:2026-08-18`,
		);
	});

	it("builds the shared pool key with the tier scope", () => {
		expect(REDIS_KEYS.quotaPoolDaily("seo-meta", "2026-08-18")).toBe(
			`rl:${TIER}:seo-meta:pool:2026-08-18`,
		);
	});

	it("builds the burst key with the window boundary", () => {
		expect(REDIS_KEYS.quotaUserBurst("seo-meta", "abc123", 29876543)).toBe(
			`rl:${TIER}:seo-meta:burst:abc123:29876543`,
		);
	});

	// `:` is the namespace separator — an unencoded segment could forge another
	// tool's namespace (a slug of `a:pool` writing into a pool counter).
	it("encodes colons in segments so a slug cannot forge a namespace", () => {
		const key = REDIS_KEYS.quotaPoolDaily("a:pool", "2026-08-18");
		expect(key).toBe(`rl:${TIER}:a%3Apool:pool:2026-08-18`);
		expect(key).not.toContain(":a:pool:");
	});

	it("encodes colons in the client hash segment", () => {
		const key = REDIS_KEYS.quotaUserDaily("seo-meta", "x:y", "2026-08-18");
		expect(key).toContain("x%3Ay");
	});

	it("scopes every key shape by the environment tier", () => {
		const keys = [
			REDIS_KEYS.quotaUserDaily("t", "h", "d"),
			REDIS_KEYS.quotaPoolDaily("t", "d"),
			REDIS_KEYS.quotaUserBurst("t", "h", 1),
		];
		for (const key of keys) expect(key.startsWith(`rl:${TIER}:`)).toBe(true);
	});
});
