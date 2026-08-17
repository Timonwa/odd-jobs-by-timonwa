/** Daily user cap for the hosted (no-BYOK) tier. */
export const SEO_META_DAILY_USER_CAP = 10;

/** Daily overall generation pool for the hosted (no-BYOK) tier. */
export const SEO_META_DAILY_SHARED_POOL = 1000;

/** SEO title length bounds — Google typically truncates titles past ~60 chars. */
export const SEO_META_TITLE_MIN = 50;
export const SEO_META_TITLE_MAX = 60;

/** SEO meta-description length bounds — Google truncates past ~160 chars. */
export const SEO_META_DESC_MIN = 150;
export const SEO_META_DESC_MAX = 160;

/** Selectable variation counts. The union, the picker options, and the action's bound all read from here. */
export const SEO_META_VARIATION_COUNTS = [1, 2, 3] as const;
export type SeoMetaVariationCount = (typeof SEO_META_VARIATION_COUNTS)[number];
export const SEO_META_DEFAULT_VARIATION_COUNT: SeoMetaVariationCount = 3;
