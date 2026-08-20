import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

// Request headers the mocked `next/headers` returns — set per-test.
let requestHeaders: Record<string, string> = {};
vi.mock("next/headers", () => ({
	headers: async () => ({
		get: (name: string) => requestHeaders[name.toLowerCase()] ?? null,
	}),
}));

const hasRedisCredentials = vi.fn(() => false);
const getRedisClient = vi.fn<() => unknown>(() => null);
vi.mock("../clients/redis", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../clients/redis")>();
	return { ...actual, hasRedisCredentials, getRedisClient };
});

// The module throws or logs at load depending on env, so every test imports it
// fresh — `vi.resetModules` clears both it and the `@env` snapshot it reads.
async function importRateLimit() {
	return import("./rate-limit.utils");
}

beforeEach(() => {
	vi.resetModules();
	vi.unstubAllEnvs();
	requestHeaders = {};
	hasRedisCredentials.mockReset().mockReturnValue(false);
	getRedisClient.mockReset().mockReturnValue(null);
	vi.spyOn(console, "error").mockImplementation(() => {});
});

const QUOTA = { toolSlug: "seo-meta", perUserDaily: 10, dailyPool: 100 };

describe("module load guards", () => {
	it("throws at load when APP_ENV=production and IP_HASH_SECRET is unset", async () => {
		vi.stubEnv("APP_ENV", "production");
		await expect(importRateLimit()).rejects.toThrow(/IP_HASH_SECRET/);
	});

	it("loads in production when IP_HASH_SECRET is set", async () => {
		vi.stubEnv("APP_ENV", "production");
		vi.stubEnv("IP_HASH_SECRET", "test-pepper");
		await expect(importRateLimit()).resolves.toBeDefined();
	});

	it("warns loudly when a platform key exists but metering credentials do not", async () => {
		vi.stubEnv("GOOGLE_API_KEY", "test-platform-key");
		await importRateLimit();
		expect(console.error).toHaveBeenCalledWith(
			expect.stringContaining("cannot be metered"),
		);
	});
});

describe("canServeHostedAi", () => {
	// NODE_ENV is "test" under Vitest, so the dev-server exemption is off — a
	// built app with no Redis credentials must refuse, never serve unmetered.
	it("fails closed without Redis credentials outside the dev server", async () => {
		const { canServeHostedAi } = await importRateLimit();
		expect(canServeHostedAi()).toBe(false);
	});

	it("allows hosted AI when metering credentials are configured", async () => {
		hasRedisCredentials.mockReturnValue(true);
		const { canServeHostedAi } = await importRateLimit();
		expect(canServeHostedAi()).toBe(true);
	});
});

describe("getRateLimitStatus", () => {
	it("reports configured from credentials without building a client", async () => {
		hasRedisCredentials.mockReturnValue(true);
		const { getRateLimitStatus } = await importRateLimit();
		expect(getRateLimitStatus()).toEqual({ configured: true });
		expect(getRedisClient).not.toHaveBeenCalled();
	});
});

describe("checkAndIncrementQuota", () => {
	it("allows untracked when no client exists (dev-server-only path)", async () => {
		const { checkAndIncrementQuota } = await importRateLimit();
		await expect(checkAndIncrementQuota(QUOTA)).resolves.toEqual({
			allowed: true,
			remaining: null,
		});
	});

	it.each([
		[1, { allowed: true, remaining: 9 }],
		[-1, { allowed: false, reason: "user" }],
		[-2, { allowed: false, reason: "pool" }],
		[-3, { allowed: false, reason: "burst" }],
	])("maps script status %i to %o", async (status, expected) => {
		const evalFn = vi.fn().mockResolvedValue([status, status === 1 ? 9 : 0]);
		getRedisClient.mockReturnValue({ eval: evalFn });
		const { checkAndIncrementQuota } = await importRateLimit();
		await expect(checkAndIncrementQuota(QUOTA)).resolves.toEqual(expected);
	});

	it("clamps a negative remaining to zero", async () => {
		getRedisClient.mockReturnValue({
			eval: vi.fn().mockResolvedValue([1, -2]),
		});
		const { checkAndIncrementQuota } = await importRateLimit();
		await expect(checkAndIncrementQuota(QUOTA)).resolves.toEqual({
			allowed: true,
			remaining: 0,
		});
	});

	it("hashes the un-spoofable IP: x-real-ip wins, else the right-most forwarded entry", async () => {
		// Left-most x-forwarded-for is attacker-controlled; the proxy appends the
		// real one last. With no pepper set, the hash is plain SHA-256.
		requestHeaders = { "x-forwarded-for": "6.6.6.6, 5.6.7.8" };
		const evalFn = vi.fn().mockResolvedValue([1, 9]);
		getRedisClient.mockReturnValue({ eval: evalFn });
		const { checkAndIncrementQuota } = await importRateLimit();
		await checkAndIncrementQuota(QUOTA);

		const expectedHash = createHash("sha256")
			.update("5.6.7.8")
			.digest("hex")
			.slice(0, 16);
		const spoofedHash = createHash("sha256")
			.update("6.6.6.6")
			.digest("hex")
			.slice(0, 16);
		const [userKey] = evalFn.mock.calls[0]?.[1] as string[];
		expect(userKey).toContain(expectedHash);
		expect(userKey).not.toContain(spoofedHash);
	});

	it("peppers the IP hash with IP_HASH_SECRET when configured", async () => {
		requestHeaders = { "x-real-ip": "5.6.7.8" };
		vi.stubEnv("IP_HASH_SECRET", "test-pepper");
		const evalFn = vi.fn().mockResolvedValue([1, 9]);
		getRedisClient.mockReturnValue({ eval: evalFn });
		const { checkAndIncrementQuota } = await importRateLimit();
		await checkAndIncrementQuota(QUOTA);

		const unkeyedHash = createHash("sha256")
			.update("5.6.7.8")
			.digest("hex")
			.slice(0, 16);
		const [userKey] = evalFn.mock.calls[0]?.[1] as string[];
		expect(userKey).not.toContain(unkeyedHash);
	});

	it("falls back to plain commands when the script fails", async () => {
		const incr = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(1);
		const expire = vi.fn().mockResolvedValue(1);
		getRedisClient.mockReturnValue({
			eval: vi.fn().mockRejectedValue(new Error("EVAL unavailable")),
			incr,
			expire,
		});
		const { checkAndIncrementQuota } = await importRateLimit();
		await expect(checkAndIncrementQuota(QUOTA)).resolves.toEqual({
			allowed: true,
			remaining: 9,
		});
		// Every counter the fallback creates still gets a TTL.
		expect(expire).toHaveBeenCalledTimes(2);
	});

	it("fails CLOSED when Redis is unreachable on both paths", async () => {
		getRedisClient.mockReturnValue({
			eval: vi.fn().mockRejectedValue(new Error("connect timeout")),
			incr: vi.fn().mockRejectedValue(new Error("connect timeout")),
			expire: vi.fn(),
		});
		const { checkAndIncrementQuota } = await importRateLimit();
		await expect(checkAndIncrementQuota(QUOTA)).resolves.toEqual({
			allowed: false,
			reason: "unavailable",
		});
	});
});
