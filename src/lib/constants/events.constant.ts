// Every custom DOM event name the app dispatches, in one place so the `tbt:<area>:<name>` format stays consistent and every signal is discoverable. Two kinds: cross-component "open a drawer" events, and store-internal sync signals a store fires so its useSyncExternalStore subscribers re-read.

import { namespaced } from "./namespace.constant";

// --- Cross-component: dispatched in one component, heard by a navbar drawer ---

/** Opens the BYOK drawer — heard by `<ByokDrawer />` in the navbar. */
export const OPEN_BYOK_EVENT = namespaced("byok", "open");

/** Opens the social-post settings drawer — heard by `<SettingsDrawer />` in the navbar. */
export const OPEN_SOCIAL_POST_SETTINGS_EVENT = namespaced(
	"social-posts",
	"open-settings",
);

// --- Store-internal: a store fires these to notify its own same-tab subscribers ---

/** BYOK key/model changed — `byok-storage` fires it so subscribers re-read (same-tab; cross-tab uses the native `storage` event). */
export const BYOK_CHANGE_EVENT = namespaced("byok", "change");

/** Hosted daily-usage updated — an AI tool broadcasts the remaining count; the navbar pill listens. */
export const HOSTED_USAGE_EVENT = namespaced("usage", "hosted");

/** Theme preference changed — `use-theme` fires it so every instance re-reads (same-tab). */
export const THEME_EVENT = namespaced("theme", "change");
