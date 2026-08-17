"use client";
// Hook for the Article to SEO Meta tool's run history — persisted in its own localStorage namespace.

import { MAX_HISTORY_ENTRIES, STORAGE_KEYS } from "@/lib/constants";
import type { HistoryEntry, SeoMetaResult, TokenUsage } from "@/lib/types";
import {
	articleSourceIdentity,
	createHistoryStore,
	createLocalStorageJson,
	isArticleSource,
} from "@/lib/utils";

const HISTORY_KEY = STORAGE_KEYS.seoMetaHistory;

/** One saved SEO run — the shared history core (source, result, timestamp) plus the keyword, variation count, and token usage for this run. */
export type SeoMetaHistory = HistoryEntry<SeoMetaResult> & {
	primaryKeyword?: string;
	variationCount: 1 | 2 | 3;
	usage?: TokenUsage;
};

/** Guards a stored value against corrupt/hand-edited localStorage (not migration). */
const isSeoMetaHistoryEntry = (e: unknown): e is SeoMetaHistory =>
	!!e &&
	typeof e === "object" &&
	typeof (e as SeoMetaHistory).id === "string" &&
	isArticleSource((e as SeoMetaHistory).source);

const { load, save } = createLocalStorageJson<SeoMetaHistory>(
	HISTORY_KEY,
	isSeoMetaHistoryEntry,
);

/** Article-to-SEO-Meta history hook — deduplicates by source, capped at 10 entries. */
export const useSeoMetaHistory = createHistoryStore<
	SeoMetaHistory,
	Omit<SeoMetaHistory, "id"> & { id?: string }
>({
	read: load,
	write: save,
	// Dedup by source — regenerating the same article/URL updates the existing
	// entry rather than creating a new one.
	applyUpsert: (current, entry) => {
		const identity = articleSourceIdentity(entry.source);
		const existing = current.find(
			(h) => articleSourceIdentity(h.source) === identity,
		);
		const full: SeoMetaHistory = {
			...entry,
			id: existing?.id ?? entry.id ?? crypto.randomUUID(),
		};
		const without = current.filter(
			(h) => articleSourceIdentity(h.source) !== identity,
		);
		return [full, ...without].slice(0, MAX_HISTORY_ENTRIES);
	},
});
