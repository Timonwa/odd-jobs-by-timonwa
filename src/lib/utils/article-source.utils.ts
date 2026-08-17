// Client-safe helpers for an article source (URL or pasted text) — identity for history dedup, and a runtime guard.

import type { ArticleSourceType } from "@/lib/types";

/** Stable identity for an article source — same URL (trimmed) or same pasted text yields the same string, so re-running the same article updates its history entry instead of adding a duplicate. */
export const articleSourceIdentity = (source: ArticleSourceType): string =>
	source.kind === "url" ? `url:${source.url.trim()}` : `text:${source.text}`;

/** Runtime type-guard that an unknown value is a valid ArticleSourceType — used to reject corrupt/hand-edited localStorage. */
export const isArticleSource = (v: unknown): v is ArticleSourceType =>
	!!v &&
	typeof v === "object" &&
	((v as ArticleSourceType).kind === "url" ||
		(v as ArticleSourceType).kind === "text");
