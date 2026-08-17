"use server";
// Server actions for the Article to Social Posts tool — generate and regenerate platform-optimized posts.

import {
	SOCIAL_POST_PLATFORM_CHAR_LIMITS,
	LONGFORM_SOCIAL_POST_LENGTH_LIMITS,
	SOCIAL_POST_DAILY_SHARED_POOL,
	SOCIAL_POST_DAILY_USER_CAP,
	THREADABLE_SOCIAL_POST_PLATFORMS,
} from "@/lib/constants";
import type {
	SocialPostPlatformType,
	LongformSocialPostLengthType,
} from "@/lib/constants";
import type {
	ArticleMetaType,
	ArticleSourceType,
	SocialPostType,
	SocialPostsResultType,
	TokenUsageType,
	SocialPostStyleType,
} from "@/lib/types";
import { generateSocialPostDrafts } from "@/lib/server/services";
import {
	articleSourceErrorRules,
	enforceDailyQuota,
	type QuotaConfigType,
	readUsage,
	resolveArticleSource,
	toUserMessage,
	withResolvedArticleUrl,
} from "@/lib/server/utils/ai";

/** Hosted-tier rate limits for this tool — per-user daily cap + the shared daily pool. */
const SOCIAL_POST_QUOTA_CONFIG: QuotaConfigType = {
	toolSlug: "article-to-social-posts",
	perUserDaily: SOCIAL_POST_DAILY_USER_CAP,
	dailyPool: SOCIAL_POST_DAILY_SHARED_POOL,
};

/** Outcome of {@link generateSocialPosts} — success carries all posts + article meta + usage; failure carries a user-facing error message. */
export type GenerateSocialPostsResultType =
	| { ok: true; data: SocialPostsResultType; remaining: number | null }
	| { ok: false; error: string };

/** Outcome of {@link regenerateSocialPost} — success carries the one rewritten post + usage + remaining quota; failure carries a user-facing error message. */
export type RegenerateSocialPostResultType =
	| {
			ok: true;
			post: SocialPostType;
			usage: TokenUsageType;
			remaining: number | null;
	  }
	| { ok: false; error: string };

/** Which action a thrown error came from — picks the right fallback message. */
type SocialPostErrorContextType = "generate" | "regenerate";

/** Turn a thrown error into a user-facing message using this tool's error rules (unreadable URL, empty/too-long text, missing post, quota exhausted, …). */
function toSocialPostErrorMessage(
	error: unknown,
	context: SocialPostErrorContextType,
	byok: boolean,
): string {
	return toUserMessage(error, {
		logTag: `article-to-social-posts:${context}`,
		perUserDaily: SOCIAL_POST_DAILY_USER_CAP,
		byok,
		rules: [
			...articleSourceErrorRules("(about 2,500 words)"),
			[
				/did not return a post/i,
				"The AI didn't create a post for one of your platforms. Just try again.",
			],
		],
		fallback:
			context === "regenerate"
				? "Something went wrong rewriting that post. Please try again."
				: "Something went wrong creating your posts. Please try again.",
	});
}

/** Resolves a platform's character ceiling — long-form platforms (LinkedIn/Substack) use the chosen post length; microblogs use their fixed limit. */
function resolveSocialPostCharLimit(
	platform: SocialPostPlatformType,
	postLength: LongformSocialPostLengthType,
): number {
	if (platform === "linkedin" || platform === "substack") {
		return LONGFORM_SOCIAL_POST_LENGTH_LIMITS[postLength];
	}
	return SOCIAL_POST_PLATFORM_CHAR_LIMITS[platform];
}

/** Assemble one post from the agent's output, computing charCount (longest thread item for threads, else content length). */
function buildSocialPost(
	platform: SocialPostPlatformType,
	content: string,
	hashtags: string[],
	charLimit: number,
	thread?: string[],
): SocialPostType {
	const charCount = thread
		? Math.max(...thread.map((p) => p.length))
		: content.length;
	return { platform, content, hashtags, thread, charCount, charLimit };
}

/** The instruction line telling the agent whether to thread (only when a thread-capable platform is selected and length > 1). */
function buildThreadModeInstruction(
	platforms: SocialPostPlatformType[],
	xThreadLength: number,
): string {
	const threadable = platforms.some((p) =>
		THREADABLE_SOCIAL_POST_PLATFORMS.includes(p),
	);
	return threadable && xThreadLength > 1
		? `Thread mode: THREAD of ${xThreadLength} posts for thread-capable platforms (x, bluesky, threads, mastodon). LinkedIn and Substack are single posts only.`
		: "Thread mode: single posts only (no threading)";
}

/** The per-request instruction block appended to the agent's system prompt — platforms, thread mode, and the full writing style. */
function buildSocialPostInstructions(
	style: SocialPostStyleType,
	platforms: SocialPostPlatformType[],
	xThreadLength: number,
): string {
	const { postLength } = style;
	const lines: string[] = [
		`Tone: ${style.tone}`,
		`Platforms: ${platforms.join(", ")}`,
	];
	if (platforms.includes("linkedin"))
		lines.push(
			`LinkedIn limit: ${LONGFORM_SOCIAL_POST_LENGTH_LIMITS[postLength]}`,
		);
	if (platforms.includes("substack"))
		lines.push(
			`Substack limit: ${LONGFORM_SOCIAL_POST_LENGTH_LIMITS[postLength]}`,
		);
	lines.push(buildThreadModeInstruction(platforms, xThreadLength));
	lines.push(`Writing style: ${JSON.stringify(style)}`);
	return lines.join("\n");
}

/** Server action — generate one platform-optimized post per selected platform from an article (URL or pasted text). */
export async function generateSocialPosts(params: {
	source: ArticleSourceType;
	platforms: SocialPostPlatformType[];
	xThreadLength: number;
	style: SocialPostStyleType;
	byokApiKey?: string;
	byokModel?: string;
}): Promise<GenerateSocialPostsResultType> {
	const { source, platforms, xThreadLength, style, byokApiKey, byokModel } =
		params;
	try {
		const { url, text } = resolveArticleSource(source);
		const remaining = await enforceDailyQuota(
			SOCIAL_POST_QUOTA_CONFIG,
			byokApiKey,
		);

		const instructions = `Generate social media posts for this article — one per selected platform.\n\n${buildSocialPostInstructions(
			style,
			platforms,
			xThreadLength,
		)}`;

		const { object, usage } = await generateSocialPostDrafts({
			instructions,
			url,
			text,
			byokApiKey,
			byokModel,
		});

		const postLength = style.postLength;
		const posts: SocialPostType[] = object.posts.map((p) =>
			buildSocialPost(
				p.platform,
				p.content,
				p.hashtags,
				resolveSocialPostCharLimit(p.platform, postLength),
				p.thread,
			),
		);
		const article: ArticleMetaType = withResolvedArticleUrl(
			object.article,
			url,
		);

		return { ok: true, data: { article, posts, usage }, remaining };
	} catch (error) {
		return {
			ok: false,
			error: toSocialPostErrorMessage(error, "generate", Boolean(byokApiKey)),
		};
	}
}

/** Server action — regenerate a single platform's post; runs at a higher temperature so the rewrite diverges from the first attempt. */
export async function regenerateSocialPost(params: {
	source: ArticleSourceType;
	platform: SocialPostPlatformType;
	xThreadLength: number;
	style: SocialPostStyleType;
	byokApiKey?: string;
	byokModel?: string;
}): Promise<RegenerateSocialPostResultType> {
	const { source, platform, xThreadLength, style, byokApiKey, byokModel } =
		params;

	try {
		const { url, text } = resolveArticleSource(source);
		const remaining = await enforceDailyQuota(
			SOCIAL_POST_QUOTA_CONFIG,
			byokApiKey,
		);

		const instructions = `Regenerate a single post for this article.\n\n${buildSocialPostInstructions(
			style,
			[platform],
			xThreadLength,
		)}\n\nReturn the article block AND exactly one post for ${platform}. Make this post noticeably different from a typical first attempt — try a fresh angle or hook.`;

		const { object, usage } = await generateSocialPostDrafts({
			instructions,
			url,
			text,
			byokApiKey,
			byokModel,
			// Push for divergence so the rewrite reads differently from the first.
			temperature: 0.9,
		});

		const postLength = style.postLength;
		const match = object.posts.find((p) => p.platform === platform);
		if (!match) {
			throw new Error(`Agent did not return a post for platform: ${platform}`);
		}

		return {
			ok: true,
			post: buildSocialPost(
				match.platform,
				match.content,
				match.hashtags,
				resolveSocialPostCharLimit(platform, postLength),
				match.thread,
			),
			usage,
			remaining,
		};
	} catch (error) {
		return {
			ok: false,
			error: toSocialPostErrorMessage(error, "regenerate", Boolean(byokApiKey)),
		};
	}
}

/** Server action — remaining-hosted-quota snapshot for the navbar usage pill. */
export async function getSocialPostsUsage() {
	return readUsage();
}
