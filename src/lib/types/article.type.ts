// Types used across the site for articles — how a source is provided, plus other article-related types.

/** Where a tool reads the article from — a URL to fetch, or pasted text. */
export type ArticleSourceType =
	{ kind: "url"; url: string } | { kind: "text"; text: string };

/** How the article source is provided — "url" or "text". */
export type ArticleSourceKindType = ArticleSourceType["kind"];

/** Parsed article metadata (title/author/url) extracted from a URL or pasted text — shared by the post and SEO tools. */
export type ArticleMetaType = {
	title?: string;
	author?: string;
	url?: string;
};
