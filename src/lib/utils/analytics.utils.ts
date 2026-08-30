// Programmatic Umami events, for interactions with no element to hang a
// `data-umami-event` attribute on. Prefer the attribute where one exists.

import { isBrowser } from "./is-browser.utils";

type UmamiTracker = {
	track: (eventName: string, eventData?: Record<string, string>) => void;
};

/**
 * Fire a Umami event by name, with optional event data (the programmatic
 * equivalent of `data-umami-event-*` attributes). A no-op when the script
 * hasn't loaded — it is gated on `APP_ENV`, so it is absent in development and
 * on previews, and a blocked or failed load must not throw inside a handler.
 */
export function trackEvent(
	eventName: string,
	eventData?: Record<string, string>,
): void {
	if (!isBrowser()) return;
	const umami = (window as unknown as { umami?: UmamiTracker }).umami;
	umami?.track(eventName, eventData);
}
