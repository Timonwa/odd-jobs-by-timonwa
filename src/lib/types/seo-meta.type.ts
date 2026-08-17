// Types for the Article to SEO Meta tool — variation and result shapes.

import type { ArticleMeta } from "./article.type";

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
