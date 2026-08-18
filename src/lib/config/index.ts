// Barrel — the app's client-safe settings.
//
// `env.ts` is deliberately absent: it is `server-only`, and re-exporting it here
// would let a client component reach server-only code through an otherwise
// client-safe barrel. It keeps its own `@env` alias for that reason.
export {
	BYOK_MODELS,
	DEFAULT_BYOK_MODEL,
	HOSTED_LLM_MODEL,
	type ByokModel,
} from "./byok";
export {
	TOOL_CATEGORIES,
	getCategory,
	type CategoryId,
	type Category,
	type CategoryColor,
} from "./categories";
export { ROUTES } from "./routes";
export {
	SITE_URL,
	SITE_DOMAIN,
	SITE_NAME,
	SITE_SHORT_NAME,
	SITE_THEME_COLOR,
	SITE_BACKGROUND_COLOR,
	SITE_TITLE,
	SITE_DESCRIPTION,
	SITE_TAGLINE,
	CREATOR_NAME,
	CREATOR_URL,
	CREATOR_TWITTER,
	CREATOR_SITE_URL,
	CREATOR_TWITTER_URL,
	CREATOR_LINKEDIN_URL,
	CREATOR_BLOG_URL,
	CREATOR_SAME_AS,
	REPO_URL,
	SUPPORT_URL,
	TERMS_URL,
	PRIVACY_URL,
	SHOP_CANONICAL_BASE,
	UMAMI_WEBSITE_ID,
	SENDER_GROUP_IDS,
	SENDER_SUBSCRIBERS_URL,
	AI_STUDIO_URL,
	AI_STUDIO_KEYS_URL,
} from "./site";
export {
	TINTS,
	TINT_SURFACE,
	TINT_ICON,
	TINT_TEXT,
	TINT_BORDER,
	TINT_HOVER_BORDER,
	type Tint,
} from "./tints";
export {
	TOOLS,
	LIVE_TOOLS,
	FEATURED_TOOLS,
	getPrimaryCategoryId,
	getToolsInCategory,
	getToolBySlug,
	getRelatedTools,
	type Tool,
} from "./tools";
