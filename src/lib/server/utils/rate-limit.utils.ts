// Hosted rate limiting — per-user and shared daily quota checks (Upstash Redis when configured).

import { createHash, createHmac } from "node:crypto";
import { Redis } from "@upstash/redis";
import { headers } from "next/headers";

import { env, isProduction } from "@env";

// Shared hosted-demo rate limiting: per-user (HMAC-SHA256 IP hash) + global pool, both resetting UTC midnight; BYOK users skip both; fails open so infra flakiness never blocks a real request.

export type QuotaConfigType = {
	toolSlug: string;
	perUserDaily: number;
	dailyPool: number;
};

export type QuotaCheckResultType =
	| { allowed: true; remaining: number | null }
	| { allowed: false; reason: "user" | "pool" };

export type RateLimitStatusType = { configured: boolean };

function getRedis(): Redis | null {
	// Production only — never rate-limit locally or on preview, even if the
	// Upstash env vars happen to be present.
	if (!isProduction) return null;
	const url = env.UPSTASH_REDIS_REST_URL;
	const token = env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) return null;
	return new Redis({ url, token });
}

function todayUtc(): string {
	return new Date().toISOString().slice(0, 10);
}

function secondsUntilUtcMidnight(): number {
	const now = new Date();
	const midnight = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate() + 1,
			0,
			0,
			0,
			0,
		),
	);
	return Math.max(60, Math.ceil((midnight.getTime() - now.getTime()) / 1000));
}

if (isProduction && !env.IP_HASH_SECRET) {
	console.warn(
		"[rate-limit] IP_HASH_SECRET is not set in production — IP hashes fall back to unkeyed SHA-256 and are brute-force reversible. Set IP_HASH_SECRET.",
	);
}

async function getClientIpHash(): Promise<string> {
	const h = await headers();
	const forwarded = h.get("x-forwarded-for");
	const real = h.get("x-real-ip");
	// `x-real-ip` is set by the platform proxy (Vercel) to the true client IP and
	// isn't client-spoofable. The left-most `x-forwarded-for` entry IS attacker-
	// controlled, so fall back to the right-most (proxy-appended) entry, not the first.
	const forwardedIp = forwarded?.split(",").at(-1)?.trim();
	const ip = real?.trim() || forwardedIp || "anonymous";
	// HMAC with a secret pepper when configured (production) so a leaked hash
	// can't be brute-forced back to an IP; plain SHA-256 otherwise (local/self-host).
	const secret = env.IP_HASH_SECRET;
	const digest = secret
		? createHmac("sha256", secret).update(ip).digest("hex")
		: createHash("sha256").update(ip).digest("hex");
	return digest.slice(0, 16);
}

/** Increment both quota counters and return whether the request is allowed, plus the caller's per-user generations left today (null when untracked) — call once per billable request, before the LLM call; skip for BYOK. */
export async function checkAndIncrementQuota(
	config: QuotaConfigType,
): Promise<QuotaCheckResultType> {
	const { toolSlug, perUserDaily, dailyPool } = config;
	const redis = getRedis();
	// Untracked (local/self-host/no Upstash) — allowed, but there's no counter to
	// report a remaining figure from.
	if (!redis) return { allowed: true, remaining: null };

	try {
		const date = todayUtc();
		const clientHash = await getClientIpHash();
		const userKey = `ratelimit:${toolSlug}:user:${clientHash}:${date}`;
		const poolKey = `ratelimit:${toolSlug}:pool:${date}`;
		const ttl = secondsUntilUtcMidnight();

		const userCount = await redis.incr(userKey);
		if (userCount === 1) await redis.expire(userKey, ttl);
		if (userCount > perUserDaily) return { allowed: false, reason: "user" };

		const poolCount = await redis.incr(poolKey);
		if (poolCount === 1) await redis.expire(poolKey, ttl);
		if (poolCount > dailyPool) return { allowed: false, reason: "pool" };

		// `userCount` already includes this request, so this is what's left after it.
		return { allowed: true, remaining: Math.max(0, perUserDaily - userCount) };
	} catch (error) {
		console.error(`[rate-limit:${toolSlug}] Redis error (failing open)`, error);
		return { allowed: true, remaining: null };
	}
}

/** Whether hosted rate-limiting is active — drives the navbar "free/day" pill. */
export function getRateLimitStatus(): RateLimitStatusType {
	return { configured: getRedis() !== null };
}
