// Validated environment variables (server + public) with typed access.

import "server-only";

import { z } from "zod";

// Env files conventionally write `KEY=""` for "not configured", so empty is
// normalized to undefined before validation. A *defined* value is then
// guaranteed non-empty, and `undefined` becomes the single meaning of "absent"
// for every consumer — previously each one had to remember its own falsy check,
// and the first that used `!== undefined` would have had a live bug.
const emptyAsAbsent = (value: unknown) => (value === "" ? undefined : value);

const secret = () => z.preprocess(emptyAsAbsent, z.string().min(1).optional());

const EnvSchema = z.object({
	// Gates production-only integrations (rate limiting, analytics). Set on deploy.
	APP_ENV: z.enum(["development", "production"]).default("development"),
	// Hub-level Gemini key; per-tool keys fall back to this one.
	GOOGLE_API_KEY: secret(),
	GOOGLE_API_KEY_ARTICLE_TO_SEO_META: secret(),
	GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST: secret(),
	// Upstash Redis for daily quotas. `.url()` so a truncated or scheme-less
	// paste fails once at boot instead of silently per request.
	UPSTASH_REDIS_REST_URL: z.preprocess(
		emptyAsAbsent,
		z.string().url().optional(),
	),
	UPSTASH_REDIS_REST_TOKEN: secret(),
	// Secret pepper for hashing IPs in rate-limit keys. Unset → plain SHA-256
	// (fine locally); set in production so hashed IPs aren't brute-force reversible.
	IP_HASH_SECRET: secret(),
	// Sender.net API token for newsletter signups. Unset → the signup form
	// reports it's unavailable instead of silently dropping addresses.
	SENDER_API_TOKEN: secret(),
});

/** Validated environment variables — all optional so the app builds without them; features degrade gracefully when unset. */
export const env = EnvSchema.parse({
	APP_ENV: process.env.APP_ENV,
	GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
	GOOGLE_API_KEY_ARTICLE_TO_SEO_META:
		process.env.GOOGLE_API_KEY_ARTICLE_TO_SEO_META,
	GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST:
		process.env.GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST,
	UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
	UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
	IP_HASH_SECRET: process.env.IP_HASH_SECRET,
	SENDER_API_TOKEN: process.env.SENDER_API_TOKEN,
});

/** Gates production-only integrations (rate limiting, analytics) off local builds. */
export const isProduction = env.APP_ENV === "production";
