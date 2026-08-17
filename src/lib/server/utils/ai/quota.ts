// Enforces and reads a tool's hosted daily quota (per-user cap + shared pool).

import {
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
 * `RATE_LIMIT_POOL`, mapped to a friendly message at the action boundary.
 */
export async function enforceDailyQuota(
	config: QuotaConfig,
	byokKey?: string,
): Promise<number | null> {
	if (byokKey) return null;
	const check = await checkAndIncrementQuota(config);
	if (!check.allowed) {
		throw new Error(
			check.reason === "user" ? "RATE_LIMIT_USER" : "RATE_LIMIT_POOL",
		);
	}
	return check.remaining;
}

/** Whether hosted rate-limiting is active (for the navbar pill). */
export function getHostedQuotaStatus() {
	return getRateLimitStatus();
}
