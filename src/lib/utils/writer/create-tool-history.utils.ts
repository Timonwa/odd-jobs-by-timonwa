"use client";
// Factory that builds a deduped, localStorage-backed run-history hook for a writer tool.

import { MAX_HISTORY_ENTRIES } from "@/lib/constants";
import type { ArticleSource } from "@/lib/types";
import {
	articleSourceIdentity,
	createHistoryStore,
	createLocalStorageJson,
} from "@/lib/utils";

/** Builds a deduped, localStorage-backed history hook under `key`, so each tool keeps its own separate run history (default: last 10). */
export function createToolHistory<
	Entry extends { id: string; source: ArticleSource },
>(opts: {
	key: string;
	isEntry: (e: unknown) => e is Entry;
	maxHistory?: number;
}) {
	const { key, isEntry, maxHistory = MAX_HISTORY_ENTRIES } = opts;
	const { load, save } = createLocalStorageJson<Entry>(key, isEntry);

	return createHistoryStore<Entry, Omit<Entry, "id"> & { id?: string }>({
		read: load,
		write: save,
		// Dedup by source — re-generating the same article updates its entry rather
		// than piling up a record per run.
		applyUpsert: (current, entry) => {
			const identity = articleSourceIdentity(entry.source);
			const existing = current.find(
				(h) => articleSourceIdentity(h.source) === identity,
			);
			const full = {
				...entry,
				id: existing?.id ?? entry.id ?? crypto.randomUUID(),
			} as Entry;
			const without = current.filter(
				(h) => articleSourceIdentity(h.source) !== identity,
			);
			return [full, ...without].slice(0, maxHistory);
		},
	});
}
