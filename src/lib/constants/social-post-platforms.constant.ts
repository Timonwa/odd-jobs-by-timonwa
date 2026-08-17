/** Ordered list of every supported platform. */
export const SOCIAL_POST_PLATFORMS = [
	"linkedin",
	"x",
	"bluesky",
	"threads",
	"mastodon",
	"substack",
] as const;
export type SocialPostPlatformType = (typeof SOCIAL_POST_PLATFORMS)[number];

/** Platforms that support multi-post threads (LinkedIn and Substack don't). */
export const THREADABLE_SOCIAL_POST_PLATFORMS: SocialPostPlatformType[] = [
	"x",
	"bluesky",
	"threads",
	"mastodon",
];

/** Human-readable display name for each platform. */
export const SOCIAL_POST_PLATFORM_LABELS: Record<
	SocialPostPlatformType,
	string
> = {
	linkedin: "LinkedIn",
	x: "X (Twitter)",
	bluesky: "Bluesky",
	threads: "Threads",
	mastodon: "Mastodon",
	substack: "Substack Notes",
};

/** Max characters per post; Substack has no hard limit so 500 is enforced to keep drafts concise. */
export const SOCIAL_POST_PLATFORM_CHAR_LIMITS: Record<
	SocialPostPlatformType,
	number
> = {
	linkedin: 3000,
	x: 280,
	bluesky: 300,
	threads: 500,
	mastodon: 500,
	substack: 500,
};

/** Tailwind text-color class for each platform's brand color. */
export const SOCIAL_POST_PLATFORM_COLORS: Record<
	SocialPostPlatformType,
	string
> = {
	linkedin: "text-blue-600 dark:text-blue-400",
	x: "text-foreground",
	bluesky: "text-sky-500",
	threads: "text-foreground",
	mastodon: "text-purple-500",
	substack: "text-orange-500",
};
