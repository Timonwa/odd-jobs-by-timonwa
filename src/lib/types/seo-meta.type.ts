// Types for the Article to SEO Meta tool — variation and result shapes.

import type { ArticleMetaType } from "./article.type";

/** One SEO meta option — a title + meta-description pair. */
export type SeoMetaVariationType = {
	title: string;
	description: string;
};

/** A completed SEO-meta generation — optional parsed article meta plus the generated variations. Parallel to SocialPostsResultType. */
export type SeoMetaResultType = {
	article?: ArticleMetaType;
	variations: SeoMetaVariationType[];
};
