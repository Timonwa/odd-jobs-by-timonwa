"use client";
// Hook for the Article to SEO Meta tool's run history — persisted in its own localStorage namespace.

import { STORAGE_KEYS, type SeoMetaVariationCount } from "@/lib/constants";
import type { HistoryEntry, SeoMetaResult, TokenUsage } from "@/lib/types";
import { createToolHistory, isArticleSource } from "@/lib/utils";

/** One saved SEO run — the shared history core (source, result, timestamp) plus the keyword, variation count, and token usage for this run. */
export type SeoMetaHistory = HistoryEntry<SeoMetaResult> & {
	primaryKeyword?: string;
	variationCount: SeoMetaVariationCount;
	usage?: TokenUsage;
};

/** Guards a stored value against corrupt/hand-edited localStorage (not migration). */
const isSeoMetaHistoryEntry = (entry: unknown): entry is SeoMetaHistory =>
	!!entry &&
	typeof entry === "object" &&
	typeof (entry as SeoMetaHistory).id === "string" &&
	!!(entry as SeoMetaHistory).result &&
	isArticleSource((entry as SeoMetaHistory).source);

/** Article-to-SEO-Meta history hook — deduplicates by source, capped at 10 entries. */
export const useSeoMetaHistory = createToolHistory<SeoMetaHistory>({
	key: STORAGE_KEYS.seoMetaHistory,
	isEntry: isSeoMetaHistoryEntry,
});
