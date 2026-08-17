import "server-only";

import { env } from "@env";

// Every Redis key is built here — the one file where a key prefix appears, the
// same rule `STORAGE_KEYS` follows for browser storage. Grep this module to see
// the whole keyspace.
//
// Segments are encoded because `:` is the namespace separator: an unencoded
// value containing one could forge a namespace (a tool slug of `a:pool` writing
// into another tool's pool counter).
//
// The tier is part of every key because one Upstash database serves every
// environment. Without it, a preview deploy would spend production's shared
// daily pool — metering now follows the credentials rather than the tier, so
// previews meter too, and they need their own counters to do it against.
const PREFIX = "rl";

const segment = (value: string | number): string =>
	encodeURIComponent(String(value));

const scope = (): string => `${PREFIX}:${segment(env.APP_ENV)}`;

export const REDIS_KEYS = {
	/** Per-caller daily counter for a tool's hosted quota. */
	quotaUserDaily: (
		toolSlug: string,
		clientHash: string,
		date: string,
	): string =>
		`${scope()}:${segment(toolSlug)}:user:${segment(clientHash)}:${segment(date)}`,
	/** Shared daily counter across all callers of a tool. */
	quotaPoolDaily: (toolSlug: string, date: string): string =>
		`${scope()}:${segment(toolSlug)}:pool:${segment(date)}`,
	/** Per-caller short-window counter, the burst ceiling on top of the daily caps. */
	quotaUserBurst: (
		toolSlug: string,
		clientHash: string,
		windowStart: number,
	): string =>
		`${scope()}:${segment(toolSlug)}:burst:${segment(clientHash)}:${segment(windowStart)}`,
} as const;
