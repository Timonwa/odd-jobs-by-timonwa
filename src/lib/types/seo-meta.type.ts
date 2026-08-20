// Types for the Article to SEO Meta tool — variation and result shapes.

import type { ArticleMeta, ArticleSource } from "./article.type";

/** One SEO meta option — a title + meta-description pair. */
export type SeoMetaVariation = {
	title: string;
	description: string;
};

/** A completed SEO-meta generation — optional parsed article meta plus the generated variations. Parallel to SocialPostsResult. */
export type SeoMetaResult = {
	article?: ArticleMeta;
	variations: SeoMetaVariation[];
};

/** The inputs one generation run used — held by the tool so a regeneration can repeat them, and seeded back into the form on a history restore. */
export type SeoMetaFormParams = {
	source: ArticleSource;
	primaryKeyword?: string;
	variationCount: 1 | 2 | 3;
};
