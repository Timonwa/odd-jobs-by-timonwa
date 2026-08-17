// Barrel — Server Actions by domain, one line per file. Importable from client
// components ("use server" modules are safe boundaries), so no server-only marker.
export {
	subscribeNewsletter,
	type NewsletterFormStateType,
} from "./newsletter.action";
export {
	generateSeoMeta,
	regenerateSeoMetaVariation,
	getSeoMetaUsage,
	type GenerateSeoMetaResultType,
	type RegenerateSeoMetaVariationResultType,
} from "./seo-meta.action";
export {
	generateSocialPosts,
	regenerateSocialPost,
	getSocialPostsUsage,
	type GenerateSocialPostsResultType,
	type RegenerateSocialPostResultType,
} from "./social-posts.action";
