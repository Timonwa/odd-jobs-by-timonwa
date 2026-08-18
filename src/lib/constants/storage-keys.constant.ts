// Central registry of every localStorage/sessionStorage key, built from the shared namespace so keys stay collision-safe and consistently formatted.

import { namespaced } from "./namespace.constant";

/** Every persisted key the app owns. Add new keys here — never inline a raw string — so the `tbt:<area>:<name>` format always holds. */
export const STORAGE_KEYS = {
	seoMetaHistory: namespaced("seo-meta", "history"),
	socialPostsHistory: namespaced("social-posts", "history"),
	byokApiKey: namespaced("byok", "api-key"),
	byokModel: namespaced("byok", "model"),
	sourceText: namespaced("source", "text"),
	sourceUrl: namespaced("source", "url"),
	sourceTextReuse: namespaced("source", "text-reuse"),
	sourceUrlReuse: namespaced("source", "url-reuse"),
	sourceKind: namespaced("source", "kind"),
	theme: namespaced("theme"),
} as const;
