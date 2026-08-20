// The app's single namespace root for browser identifiers — localStorage/sessionStorage keys and custom DOM event names — so nothing collides with other scripts sharing the domain.

/** Root prefix for every app-owned storage key and event name. Short (counts against the storage quota) and unique to this app. */
export const APP_NAMESPACE = "tbt";

/** Build a namespaced `tbt:<area>:<name>` identifier. Shared by storage keys and event names so both follow one format and drift is impossible. */
export const namespaced = (...segments: string[]): string =>
	[APP_NAMESPACE, ...segments].join(":");
