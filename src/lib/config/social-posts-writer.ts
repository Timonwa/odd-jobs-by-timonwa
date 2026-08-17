"use client";
// Article to Social Posts binding of the shared writer engine — wires this tool's stores, hooks, and actions.

import type { WriterRuntime } from "@/lib/types";
import {
	generateSocialPosts,
	regenerateSocialPost,
} from "@/lib/server/actions";
import {
	useSocialPostsHistory,
	useSocialPostsStyleTemplates,
} from "@/lib/hooks";
import {
	styleStorage,
	setTone,
	setXThreadLength,
	togglePlatform,
	workflowStorage,
} from "@/lib/utils";

/** Article-to-Social-Posts binding of the shared writer engine: one post per platform, no prompt editor or repurposing. */
export const socialPostsRuntime: WriterRuntime = {
	features: { hashtagRules: true, promptEditor: false, repurpose: false },
	stores: {
		styleStorage,
		workflowStorage,
		setTone,
		togglePlatform,
		setXThreadLength,
	},
	useStyleTemplates: useSocialPostsStyleTemplates,
	useHistory: useSocialPostsHistory,
	onGenerate: generateSocialPosts,
	onRegenerate: regenerateSocialPost,
};
