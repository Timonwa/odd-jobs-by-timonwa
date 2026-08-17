// Hosted rate limiting — per-user, burst, and shared daily quota checks (Upstash Redis when configured).

import { createHash, createHmac } from "node:crypto";
import { headers } from "next/headers";

import { env, isProduction } from "@env";

import {
	currentBurstWindow,
	getRedisClient,
	hasRedisCredentials,
	REDIS_KEYS,
	secondsUntilUtcMidnight,
	todayUtc,
	BURST_WINDOW_SECONDS,
} from "../clients/redis";

// Shared hosted-demo rate limiting: a per-caller daily cap, a short burst
// window that paces consumption, and a global daily pool. BYOK users skip all
// three. Fails CLOSED — see `checkAndIncrementQuota`.

export type QuotaConfig = {
	toolSlug: string;
	perUserDaily: number;
	dailyPool: number;
	/** Max requests per caller inside one burst window. Defaults to a share of the daily cap. */
	perUserBurst?: number;
};

export type QuotaCheckResult =
	| { allowed: true; remaining: number | null }
	| { allowed: false; reason: "user" | "pool" | "burst" | "unavailable" };

export type RateLimitStatus = { configured: boolean };

// Metering follows the credentials, not the tier. Gating on `isProduction`
// meant a deploy with APP_ENV unset — the schema's default — served unlimited
// generations on the platform key with no error, and left preview deploys
// uncapped too. Only the dev server is exempt, so local work needs no Upstash
// account; anything built and served meters if it can, and refuses if it can't
// (see `canServeHostedAi`).
const isDevServer = process.env.NODE_ENV === "development";

/** Whether a hosted (platform-key) generation may run at all: metering is live, or this is the dev server. False means the caller must fall back to BYOK — the alternative is unmetered spend on the platform key. */
export function canServeHostedAi(): boolean {
	return isDevServer || hasRedisCredentials();
}

if (isProduction && !env.IP_HASH_SECRET) {
	console.warn(
		"[rate-limit] IP_HASH_SECRET is not set in production — IP hashes fall back to unkeyed SHA-256 and are brute-force reversible. Set IP_HASH_SECRET.",
	);
}

// Loud at boot, because the per-request symptom is indistinguishable from
// working: a rotated or typo'd Upstash credential looks exactly like "no rate
// limiting configured". Hosted generations refuse while this is true.
if (!isDevServer && !hasRedisCredentials() && env.GOOGLE_API_KEY) {
	console.error(
		"[rate-limit] A platform Gemini key is configured but Upstash credentials are not, so hosted generations cannot be metered and will be refused. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN, or unset GOOGLE_API_KEY to run BYOK-only.",
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

// One script, so the whole check-and-charge is atomic and costs a single
// round-trip. Two properties the previous INCR-then-EXPIRE pairs couldn't give:
//
// 1. A counter can never end up without a TTL. Previously `EXPIRE` was a second
//    command gated on `count === 1`, so if it was lost (swallowed error, killed
//    invocation) no later request ever repaired it and the key lived forever.
// 2. Nothing is charged for a request that gets denied. Previously the caller's
//    counter was incremented before the pool was checked, so once the shared
//    pool ran out a visitor silently burned their own daily allowance on
//    requests that returned nothing.
//
// Returns [status, remaining] where status is 1 allowed, -1 user cap, -2 pool
// exhausted, -3 burst window.
const CHECK_AND_CHARGE = `
local userKey, burstKey, poolKey = KEYS[1], KEYS[2], KEYS[3]
local userMax = tonumber(ARGV[1])
local burstMax = tonumber(ARGV[2])
local poolMax = tonumber(ARGV[3])
local dayTtl = tonumber(ARGV[4])
local burstTtl = tonumber(ARGV[5])

if tonumber(redis.call('GET', userKey) or '0') >= userMax then return {-1, 0} end
if tonumber(redis.call('GET', burstKey) or '0') >= burstMax then return {-3, 0} end
if tonumber(redis.call('GET', poolKey) or '0') >= poolMax then return {-2, 0} end

local userCount = redis.call('INCR', userKey)
if userCount == 1 then redis.call('EXPIRE', userKey, dayTtl) end
local burstCount = redis.call('INCR', burstKey)
if burstCount == 1 then redis.call('EXPIRE', burstKey, burstTtl) end
local poolCount = redis.call('INCR', poolKey)
if poolCount == 1 then redis.call('EXPIRE', poolKey, dayTtl) end

return {1, userMax - userCount}
`;

/** Charge all three quota counters atomically and report whether the request may proceed, plus the caller's generations left today (null when untracked) — call once per billable request, before the LLM call; skip for BYOK. */
export async function checkAndIncrementQuota(
	config: QuotaConfig,
): Promise<QuotaCheckResult> {
	const { toolSlug, perUserDaily, dailyPool } = config;
	// A caller shouldn't be able to spend a whole day's allowance in one minute,
	// but the burst ceiling still has to clear a legitimate burst of retries.
	const perUserBurst =
		config.perUserBurst ?? Math.max(3, Math.ceil(perUserDaily / 2));
	const redis = getRedisClient();
	// Untracked — only reachable on the dev server, since `canServeHostedAi`
	// refuses a built app with no credentials before this is called.
	if (!redis) return { allowed: true, remaining: null };

	try {
		const date = todayUtc();
		const clientHash = await getClientIpHash();
		const result = (await redis.eval(
			CHECK_AND_CHARGE,
			[
				REDIS_KEYS.quotaUserDaily(toolSlug, clientHash, date),
				REDIS_KEYS.quotaUserBurst(toolSlug, clientHash, currentBurstWindow()),
				REDIS_KEYS.quotaPoolDaily(toolSlug, date),
			],
			[
				perUserDaily,
				perUserBurst,
				dailyPool,
				secondsUntilUtcMidnight(),
				BURST_WINDOW_SECONDS,
			],
		)) as [number, number];

		const [status, remaining] = result;
		if (status === -1) return { allowed: false, reason: "user" };
		if (status === -2) return { allowed: false, reason: "pool" };
		if (status === -3) return { allowed: false, reason: "burst" };
		return { allowed: true, remaining: Math.max(0, remaining) };
	} catch (scriptError) {
		// The script is the fast path, not the only one. A script-level failure
		// (a Lua defect, EVAL unavailable on the plan) shouldn't take hosted AI
		// down, so retry with plain commands — the behaviour this replaced, which
		// is weaker (charge-then-check, non-atomic TTL) but known good.
		console.error(
			`[rate-limit:${toolSlug}] quota script failed — falling back to plain commands`,
			scriptError instanceof Error ? scriptError.message : String(scriptError),
		);
		try {
			return await chargeWithPlainCommands(redis, config);
		} catch (redisError) {
			// Both paths failed, so Redis itself is unreachable: fail CLOSED. A rate
			// limiter has nothing to degrade to — allowing would turn an Upstash blip
			// into unbounded spend on the platform key, and that outage window is
			// exactly what an abuser would wait for. Denying costs the user a key
			// paste, since BYOK bypasses the quota entirely.
			console.error(
				`[rate-limit:${toolSlug}] Redis unreachable — denying (fail closed)`,
				redisError instanceof Error ? redisError.message : String(redisError),
			);
			return { allowed: false, reason: "unavailable" };
		}
	}
}

/** The pre-script counter path, kept as a fallback so a scripting failure degrades instead of refusing every hosted request. Charges before checking the pool, so it can over-charge a denied caller — acceptable in a path that should never run. */
async function chargeWithPlainCommands(
	redis: NonNullable<ReturnType<typeof getRedisClient>>,
	config: QuotaConfig,
): Promise<QuotaCheckResult> {
	const { toolSlug, perUserDaily, dailyPool } = config;
	const date = todayUtc();
	const clientHash = await getClientIpHash();
	const ttl = secondsUntilUtcMidnight();
	const userKey = REDIS_KEYS.quotaUserDaily(toolSlug, clientHash, date);
	const poolKey = REDIS_KEYS.quotaPoolDaily(toolSlug, date);

	const userCount = await redis.incr(userKey);
	if (userCount === 1) await redis.expire(userKey, ttl);
	if (userCount > perUserDaily) return { allowed: false, reason: "user" };

	const poolCount = await redis.incr(poolKey);
	if (poolCount === 1) await redis.expire(poolKey, ttl);
	if (poolCount > dailyPool) return { allowed: false, reason: "pool" };

	return { allowed: true, remaining: Math.max(0, perUserDaily - userCount) };
}

/** Whether hosted rate-limiting is active — drives the navbar "free/day" pill. Answered from config, without constructing a client. */
export function getRateLimitStatus(): RateLimitStatus {
	return { configured: hasRedisCredentials() };
}
