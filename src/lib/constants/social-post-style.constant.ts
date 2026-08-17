// Writing-style constants for social posts — tones, voices, density scales, post-length limits, and the default style.

import type { SocialPostStyleType } from "@/lib/types";

/** Factory-default writing style applied on first use. */
export const SOCIAL_POST_DEFAULT_STYLE: SocialPostStyleType = {
	voice: "i",
	tone: "auto",
	emojiLevel: 2,
	hashtagLevel: 1,
	alwaysIncludeHashtags: [],
	neverUseHashtags: [],
	postLength: "medium",
};

/** All selectable tones with their UI label and short description. */
export const SOCIAL_POST_TONES = [
	{ value: "auto", label: "Auto", description: "Platform-appropriate" },
	{ value: "professional", label: "Professional", description: "Polished" },
	{ value: "casual", label: "Casual", description: "Friendly" },
	{ value: "educational", label: "Educational", description: "Explanatory" },
	{ value: "punchy", label: "Punchy", description: "Bold, short" },
] as const;
export type SocialPostToneType = (typeof SOCIAL_POST_TONES)[number]["value"];

/** Upper bound per list — keeps the prompt small and the UI readable. */
export const MAX_SOCIAL_POST_HASHTAG_RULES_PER_LIST = 10;
/** Upper bound on saved style templates — localStorage stays lean. */
export const MAX_SOCIAL_POST_STYLE_TEMPLATES = 10;
/** Max style-template name length — keeps chips short and the collapsed label tidy. */
export const MAX_SOCIAL_POST_STYLE_TEMPLATE_NAME_CHARS = 30;

/** Display label for each grammatical-voice option. */
export const SOCIAL_POST_VOICE_LABELS = {
	i: "I",
	we: "We",
	they: "Third-person",
};
export type SocialPostVoiceType = keyof typeof SOCIAL_POST_VOICE_LABELS;

/** Density scale (1 = none … 5 = heavy), shared by emoji and hashtag settings. */
export const SOCIAL_POST_DENSITY_LEVELS = [1, 2, 3, 4, 5] as const;
export type SocialPostDensityLevelType =
	(typeof SOCIAL_POST_DENSITY_LEVELS)[number];

/** Display label for each emoji-density level. */
export const SOCIAL_POST_EMOJI_DENSITY_LABELS: Record<
	SocialPostDensityLevelType,
	string
> = {
	1: "None",
	2: "Light",
	3: "Balanced",
	4: "Expressive",
	5: "Heavy",
};

/** Display label for each hashtag-density level. */
export const SOCIAL_POST_HASHTAG_DENSITY_LABELS: Record<
	SocialPostDensityLevelType,
	string
> = {
	1: "None",
	2: "Few",
	3: "Standard",
	4: "Many",
	5: "Lots",
};

/** Target character counts for long-form platforms (LinkedIn + Substack); microblog platforms use their own fixed limits. */
export const LONGFORM_SOCIAL_POST_LENGTH_LIMITS = {
	short: 600,
	medium: 1500,
	long: 3000,
};
export type LongformSocialPostLengthType =
	keyof typeof LONGFORM_SOCIAL_POST_LENGTH_LIMITS;

/** Display label for each long-form post-length option. */
export const LONGFORM_SOCIAL_POST_LENGTH_LABELS: Record<
	LongformSocialPostLengthType,
	string
> = {
	short: "Short (~600)",
	medium: "Medium (~1,500)",
	long: "Long (~3,000)",
};
