"use client";
// Hook for the Article to Social Posts tool's run history — persisted in its own localStorage namespace.

import { STORAGE_KEYS } from "@/lib/constants";
import { createToolHistory } from "@/lib/utils/writer/create-tool-history.utils";
import type { SocialPostHistory } from "@/lib/types";
import { isArticleSource } from "@/lib/utils";

/** Guards a stored value against corrupt/hand-edited localStorage (not migration). */
const isSocialPostHistoryEntry = (e: unknown): e is SocialPostHistory =>
	!!e &&
	typeof e === "object" &&
	typeof (e as SocialPostHistory).id === "string" &&
	isArticleSource((e as SocialPostHistory).source) &&
	!!(e as SocialPostHistory).result;

/** Article-to-Social-Posts history — its own localStorage namespace. */
export const useSocialPostsHistory = createToolHistory<SocialPostHistory>({
	key: STORAGE_KEYS.socialPostsHistory,
	isEntry: isSocialPostHistoryEntry,
});
