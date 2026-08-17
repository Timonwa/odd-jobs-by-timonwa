// Shared shape for a tool's saved run-history entry.

import type { ArticleSource } from "./article.type";

/** One saved run in a tool's history — the article source, the generated result, and when it ran. Each tool extends this with its own per-run fields. */
export type HistoryEntry<TResult> = {
	id: string;
	source: ArticleSource;
	result: TResult;
	timestamp: number;
};
