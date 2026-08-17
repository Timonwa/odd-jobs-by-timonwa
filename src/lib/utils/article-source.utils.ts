// Client-safe helpers for an article source (URL or pasted text) — identity for history dedup, and a runtime guard.

import type { ArticleSource } from "@/lib/types";

/** Stable identity for an article source — same URL (trimmed) or same pasted text yields the same string, so re-running the same article updates its history entry instead of adding a duplicate. */
export const articleSourceIdentity = (source: ArticleSource): string =>
	source.kind === "url" ? `url:${source.url.trim()}` : `text:${source.text}`;

/** Runtime type-guard that an unknown value is a valid ArticleSource — used to reject corrupt/hand-edited localStorage. */
export const isArticleSource = (v: unknown): v is ArticleSource =>
	!!v &&
	typeof v === "object" &&
	((v as ArticleSource).kind === "url" || (v as ArticleSource).kind === "text");
