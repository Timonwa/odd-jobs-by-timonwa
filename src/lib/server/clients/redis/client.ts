import "server-only";

import { Redis } from "@upstash/redis";

import { env } from "@env";

// One client for the process, created on first use. Upstash's REST transport is
// stateless so a per-call client leaked no sockets, but it left nowhere to set
// `enableAutoPipelining` and no single place to configure the connection.
let client: Redis | null = null;

/** Whether Upstash credentials are configured — answerable without building a client, so callers that only need a boolean don't pay for one. */
export function hasRedisCredentials(): boolean {
	return Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN);
}

/** The shared Redis client, or null when Upstash isn't configured. */
export function getRedisClient(): Redis | null {
	if (client) return client;
	const url = env.UPSTASH_REDIS_REST_URL;
	const token = env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) return null;
	// Auto-pipelining collapses concurrent commands into one HTTP round-trip.
	client = new Redis({ url, token, enableAutoPipelining: true });
	return client;
}
