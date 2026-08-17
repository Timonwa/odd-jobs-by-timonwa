// Barrel — Server Actions by domain, one line per file. Importable from client
// components ("use server" modules are safe boundaries), so no server-only marker.
export {
	subscribeNewsletter,
	type NewsletterFormState,
} from "./newsletter.action";
export {
	generateSeoMeta,
	regenerateSeoMetaVariation,
	fetchSeoMetaUsage,
	type GenerateSeoMetaResult,
	type RegenerateSeoMetaVariationResult,
} from "./seo-meta.action";
export {
	generateSocialPosts,
	regenerateSocialPost,
	fetchSocialPostsUsage,
	type GenerateSocialPostsResult,
	type RegenerateSocialPostResult,
} from "./social-posts.action";
