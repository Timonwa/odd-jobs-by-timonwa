"use client";
// Hook for the Article to Social Posts tool's saved writing-style templates.

import {
	SOCIAL_POST_DEFAULT_STYLE,
	MAX_SOCIAL_POST_STYLE_TEMPLATES,
} from "@/lib/constants";
import type { SocialPostStyleTemplate } from "@/lib/types";
import { styleStorage, styleTemplatesStorage } from "@/lib/utils";
import { createSocialPostsStyleTemplates } from "@/lib/hooks/writer/create-social-posts-style-templates";

/** Starter writing styles seeded on first run — style only (no platforms or thread length), spanning distinct voices so new users have varied examples. */
const STARTER_STYLE_TEMPLATES: Omit<
	SocialPostStyleTemplate,
	"id" | "createdAt"
>[] = [
	{
		name: "Professional",
		style: {
			...SOCIAL_POST_DEFAULT_STYLE,
			tone: "professional",
			emojiLevel: 1,
			hashtagLevel: 2,
		},
	},
	{
		name: "Punchy",
		style: {
			...SOCIAL_POST_DEFAULT_STYLE,
			tone: "punchy",
			emojiLevel: 3,
			hashtagLevel: 2,
		},
	},
	{
		name: "Casual",
		style: { ...SOCIAL_POST_DEFAULT_STYLE, tone: "casual", emojiLevel: 4 },
	},
];

/** Shared style-template CRUD hook backed by localStorage — used by both the writer form and the settings drawer so they stay in sync. */
export const useSocialPostsStyleTemplates = createSocialPostsStyleTemplates({
	styleStorage,
	styleTemplatesStorage,
	starterStyleTemplates: STARTER_STYLE_TEMPLATES,
	maxStyleTemplates: MAX_SOCIAL_POST_STYLE_TEMPLATES,
});
