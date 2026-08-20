import "server-only";

// TTL presets live here so no expiry is defined inline. Every key written by
// this app gets one — an un-expiring key is a permanent memory and cost leak.

/** Burst window length. Short by design: it paces consumption so one actor can't drain a shared daily pool in minutes. */
export const BURST_WINDOW_SECONDS = 60;

/** Seconds until the next UTC midnight, floored at 60 so a key written moments before the boundary still outlives its own request. */
export function secondsUntilUtcMidnight(): number {
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

/** Current UTC date as `YYYY-MM-DD` — the daily counters' window. */
export function todayUtc(): string {
	return new Date().toISOString().slice(0, 10);
}

/** Start of the current burst window, as a unix-second boundary. */
export function currentBurstWindow(): number {
	return Math.floor(Date.now() / 1000 / BURST_WINDOW_SECONDS);
}
