// Shared shape for a tool's saved run-history entry.

import type { ArticleSourceType } from "./article.type";

/** One saved run in a tool's history — the article source, the generated result, and when it ran. Each tool extends this with its own per-run fields. */
export type HistoryEntryType<TResult> = {
	id: string;
	source: ArticleSourceType;
	result: TResult;
	timestamp: number;
};
