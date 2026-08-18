// Input schemas for the Article to Social Posts Server Actions.
//
// Every enum is derived from the constant that already defines it, cast to the
// tuple shape `z.enum` needs — so the inferred types stay the narrow unions the
// rest of the app uses, and adding a platform or tone can't leave the schema
// behind.

import { z } from "zod";

import {
	LONGFORM_SOCIAL_POST_LENGTH_LIMITS,
	MAX_SOCIAL_POST_HASHTAG_RULES_PER_LIST,
	SOCIAL_POST_DENSITY_LEVELS,
	SOCIAL_POST_PLATFORMS,
	SOCIAL_POST_TONES,
	SOCIAL_POST_VOICE_LABELS,
	type LongformSocialPostLength,
	type SocialPostDensityLevel,
	type SocialPostPlatform,
	type SocialPostTone,
	type SocialPostVoice,
} from "@/lib/constants";
import { ArticleSourceSchema, ByokInputSchema } from "./shared.schema";

type Tuple<T> = [T, ...T[]];

const PlatformSchema = z.enum(
	SOCIAL_POST_PLATFORMS as unknown as Tuple<SocialPostPlatform>,
);

const ToneSchema = z.enum(
	SOCIAL_POST_TONES.map((tone) => tone.value) as Tuple<SocialPostTone>,
);

const VoiceSchema = z.enum(
	Object.keys(SOCIAL_POST_VOICE_LABELS) as Tuple<SocialPostVoice>,
);

const PostLengthSchema = z.enum(
	Object.keys(
		LONGFORM_SOCIAL_POST_LENGTH_LIMITS,
	) as Tuple<LongformSocialPostLength>,
);

const DensityLevelSchema = z.custom<SocialPostDensityLevel>((value) =>
	(SOCIAL_POST_DENSITY_LEVELS as readonly number[]).includes(value as number),
);

const HashtagListSchema = z
	.array(z.string().max(80))
	.max(MAX_SOCIAL_POST_HASHTAG_RULES_PER_LIST);

/** The writing style, as a closed object. Previously this was `JSON.stringify`-ed into the prompt wholesale, so any extra keys a caller invented were forwarded to the model verbatim. */
export const SocialPostStyleSchema = z.object({
	voice: VoiceSchema,
	tone: ToneSchema,
	emojiLevel: DensityLevelSchema,
	hashtagLevel: DensityLevelSchema,
	alwaysIncludeHashtags: HashtagListSchema,
	neverUseHashtags: HashtagListSchema,
	postLength: PostLengthSchema,
});

export const GenerateSocialPostsInputSchema = ByokInputSchema.extend({
	source: ArticleSourceSchema,
	// One post per platform, so the array is bounded by the platform list itself.
	platforms: z.array(PlatformSchema).min(1).max(SOCIAL_POST_PLATFORMS.length),
	xThreadLength: z.number().int().min(1).max(10),
	style: SocialPostStyleSchema,
});

export type GenerateSocialPostsInput = z.infer<
	typeof GenerateSocialPostsInputSchema
>;

export const RegenerateSocialPostInputSchema = ByokInputSchema.extend({
	source: ArticleSourceSchema,
	platform: PlatformSchema,
	xThreadLength: z.number().int().min(1).max(10),
	style: SocialPostStyleSchema,
});

export type RegenerateSocialPostInput = z.infer<
	typeof RegenerateSocialPostInputSchema
>;
