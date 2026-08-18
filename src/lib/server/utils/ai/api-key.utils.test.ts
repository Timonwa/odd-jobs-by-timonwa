import { beforeEach, describe, expect, it, vi } from "vitest";

// `@env` snapshots process.env at import, so each test re-imports after stubbing.
async function importWithEnv(hubKey?: string) {
	vi.resetModules();
	vi.unstubAllEnvs();
	if (hubKey !== undefined) vi.stubEnv("GOOGLE_API_KEY", hubKey);
	return import("./api-key.utils");
}

beforeEach(() => {
	vi.unstubAllEnvs();
});

describe("resolvePlatformApiKey", () => {
	it("prefers the per-tool key when set", async () => {
		const { resolvePlatformApiKey } = await importWithEnv("hub-key");
		expect(resolvePlatformApiKey("tool-key")).toBe("tool-key");
	});

	it("falls back to the hub key when the per-tool key is unset", async () => {
		const { resolvePlatformApiKey } = await importWithEnv("hub-key");
		expect(resolvePlatformApiKey(undefined)).toBe("hub-key");
	});

	// Env files often write `KEY=""` for "not configured".
	it.each(["", "   "])(
		"treats a blank per-tool key (%j) as absent and falls back",
		async (blank) => {
			const { resolvePlatformApiKey } = await importWithEnv("hub-key");
			expect(resolvePlatformApiKey(blank)).toBe("hub-key");
		},
	);

	it("returns undefined when no key is configured at all", async () => {
		const { resolvePlatformApiKey } = await importWithEnv(undefined);
		expect(resolvePlatformApiKey(undefined)).toBeUndefined();
	});
});
