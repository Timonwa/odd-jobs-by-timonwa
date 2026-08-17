// Enforces and reads a tool's hosted daily quota (per-user cap + shared pool).

import {
	canServeHostedAi,
	checkAndIncrementQuota,
	getRateLimitStatus,
	type QuotaConfig,
} from "../rate-limit.utils";

/**
 * Per-tool hosted-demo quota config. Counters are scoped by `toolSlug` so tools
 * don't share budgets. New AI tools define one and pass it to `enforceDailyQuota`.
 */
export type { QuotaConfig };

/**
 * Enforce a tool's two hosted daily caps — the per-user daily limit and the
 * shared daily pool — and return the caller's per-user generations left today
 * (`null` when untracked or BYOK). BYOK requests (a user-supplied key) skip the
 * check — they're on their own Gemini budget. Throws `RATE_LIMIT_USER` /
 * `RATE_LIMIT_POOL` / `QUOTA_UNAVAILABLE`, mapped to a friendly message at the
 * action boundary.
 */
export async function enforceDailyQuota(
	config: QuotaConfig,
	byokKey?: string,
): Promise<number | null> {
	if (byokKey) return null;
	// Fail closed: without live metering, a hosted generation is unbounded spend
	// on the platform key. Refusing sends the user to BYOK, which the UI offers.
	if (!canServeHostedAi()) throw new Error("QUOTA_UNAVAILABLE");
	const check = await checkAndIncrementQuota(config);
	if (!check.allowed) {
		const CODES = {
			user: "RATE_LIMIT_USER",
			pool: "RATE_LIMIT_POOL",
			burst: "RATE_LIMIT_BURST",
			unavailable: "QUOTA_UNAVAILABLE",
		} as const;
		throw new Error(CODES[check.reason]);
	}
	return check.remaining;
}

/** Whether hosted rate-limiting is active (for the navbar pill). */
export function getHostedQuotaStatus() {
	return getRateLimitStatus();
}
