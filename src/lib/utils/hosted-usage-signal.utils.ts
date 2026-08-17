"use client";

/** Cross-component signal for the hosted daily-usage pill — an AI tool broadcasts how many free generations the user has left after a hosted run, and the navbar pill listens and updates in place. */

import { HOSTED_USAGE_EVENT } from "@/lib/constants";
import { isBrowser } from "@/lib/utils/is-browser";

type HostedUsageDetailType = { remaining: number };

/** Broadcast the per-user hosted generations left today; a no-op for BYOK or untracked runs, where `remaining` is null. */
export function emitHostedUsage(remaining: number | null) {
	if (remaining == null || !isBrowser()) return;
	window.dispatchEvent(
		new CustomEvent<HostedUsageDetailType>(HOSTED_USAGE_EVENT, {
			detail: { remaining },
		}),
	);
}

/** Subscribe to hosted-usage broadcasts; returns an unsubscribe fn. */
export function subscribeHostedUsage(onUpdate: (remaining: number) => void) {
	if (!isBrowser()) return () => {};
	const handler = (event: Event) => {
		onUpdate((event as CustomEvent<HostedUsageDetailType>).detail.remaining);
	};
	window.addEventListener(HOSTED_USAGE_EVENT, handler);
	return () => window.removeEventListener(HOSTED_USAGE_EVENT, handler);
}
