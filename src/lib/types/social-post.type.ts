// Types for social-post generation — posts, writing style, style templates, and run history.

import type {
	SocialPostDensityLevel,
	SocialPostPlatform,
	LongformSocialPostLength,
	SocialPostTone,
	SocialPostVoice,
} from "@/lib/constants";
import type { ArticleMeta } from "./article.type";
import type { HistoryEntry } from "./history.type";
import type { TokenUsage } from "./token-usage.type";

/** One generated post for a platform — text (or a thread), hashtags, and its character budget. */
export type SocialPost = {
	platform: SocialPostPlatform;
	content: string;
	thread?: string[];
	hashtags: string[];
	charCount: number;
	charLimit: number;
};

/** A completed generation — parsed article meta, one post per platform, and token usage. */
export type SocialPostsResult = {
	article: ArticleMeta;
	posts: SocialPost[];
	usage: TokenUsage;
};

/** How posts should sound — sticky, reusable voice. Saved and switched via style templates. */
export type SocialPostStyle = {
	voice: SocialPostVoice;
	tone: SocialPostTone;
	emojiLevel: SocialPostDensityLevel;
	hashtagLevel: SocialPostDensityLevel;
	alwaysIncludeHashtags: string[];
	neverUseHashtags: string[];
	postLength: LongformSocialPostLength;
};

/** A named, reusable writing style — e.g. one per blog or client. Stores style only; platforms and thread length are per-run workflow, never saved here. */
export type SocialPostStyleTemplate = {
	id: string;
	name: string;
	createdAt: number;
	style: SocialPostStyle;
};

/** One saved social-post run — the shared history core (source, result, timestamp) plus this tool's per-run config. Each tool stores under its own key. */
export type SocialPostHistory = HistoryEntry<SocialPostsResult> & {
	style: SocialPostStyle;
	platforms: SocialPostPlatform[];
	xThreadLength: number;
	styleTemplateName?: string;
};
