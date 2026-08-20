import { beforeEach, describe, expect, it, vi } from "vitest";

const canServeHostedAi = vi.fn(() => true);
const checkAndIncrementQuota = vi.fn();
const getRateLimitStatus = vi.fn(() => ({ configured: true }));
vi.mock("../rate-limit.utils", () => ({
	canServeHostedAi: () => canServeHostedAi(),
	checkAndIncrementQuota: (config: unknown) => checkAndIncrementQuota(config),
	getRateLimitStatus: () => getRateLimitStatus(),
}));

import { enforceDailyQuota, getHostedQuotaStatus } from "./quota.utils";

const QUOTA = { toolSlug: "seo-meta", perUserDaily: 10, dailyPool: 100 };

beforeEach(() => {
	canServeHostedAi.mockReset().mockReturnValue(true);
	checkAndIncrementQuota.mockReset();
});

describe("enforceDailyQuota", () => {
	// A user-supplied key spends the user's own Gemini budget, never the pool.
	it("skips metering entirely for BYOK requests", async () => {
		await expect(enforceDailyQuota(QUOTA, "byok-key")).resolves.toBeNull();
		expect(canServeHostedAi).not.toHaveBeenCalled();
		expect(checkAndIncrementQuota).not.toHaveBeenCalled();
	});

	it("throws QUOTA_UNAVAILABLE before charging when hosted AI cannot be metered", async () => {
		canServeHostedAi.mockReturnValue(false);
		await expect(enforceDailyQuota(QUOTA)).rejects.toThrow("QUOTA_UNAVAILABLE");
		expect(checkAndIncrementQuota).not.toHaveBeenCalled();
	});

	it("returns the caller's remaining allowance when allowed", async () => {
		checkAndIncrementQuota.mockResolvedValue({ allowed: true, remaining: 7 });
		await expect(enforceDailyQuota(QUOTA)).resolves.toBe(7);
		expect(checkAndIncrementQuota).toHaveBeenCalledWith(QUOTA);
	});

	it.each([
		["user", "RATE_LIMIT_USER"],
		["pool", "RATE_LIMIT_POOL"],
		["burst", "RATE_LIMIT_BURST"],
		["unavailable", "QUOTA_UNAVAILABLE"],
	])("maps a %s denial to the coded error %s", async (reason, code) => {
		checkAndIncrementQuota.mockResolvedValue({ allowed: false, reason });
		await expect(enforceDailyQuota(QUOTA)).rejects.toThrow(code);
	});
});

describe("getHostedQuotaStatus", () => {
	it("passes the rate-limit status through", () => {
		expect(getHostedQuotaStatus()).toEqual({ configured: true });
	});
});
