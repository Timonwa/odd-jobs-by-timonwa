// Types for the shared writer engine — the runtime contract, generation params, and results.

import type {
	SocialPostPlatformType,
	SocialPostToneType,
} from "@/lib/constants";
import type {
	ArticleSourceType,
	SocialPostHistoryType,
	SocialPostType,
	SocialPostStyleTemplateType,
	SocialPostsResultType,
	TokenUsageType,
	SocialPostStyleType,
} from "@/lib/types";
import type { WorkflowStateType } from "@/lib/utils";

/** Minimal external-store shape (useSyncExternalStore-compatible) the engine reads and writes. */
type StoreType<T> = {
	get: () => T;
	set: (value: T) => void;
	subscribe: (cb: () => void) => () => void;
	getSnapshot: () => T;
	getServerSnapshot: () => T;
};

/** Extras a tool may add to a generation request (populated by conditional form controls). */
export type GenerateExtrasType = {
	prompt?: string;
	variantCount?: number;
};

/** Inputs for a full generation run — article, target platforms, thread length, writing style, and optional BYOK credentials. */
export type GenerateParamsType = {
	source: ArticleSourceType;
	platforms: SocialPostPlatformType[];
	xThreadLength: number;
	style: SocialPostStyleType;
	byokApiKey?: string;
	byokModel?: string;
} & GenerateExtrasType;

/** Inputs for regenerating a single platform's post. */
export type RegenerateParamsType = {
	source: ArticleSourceType;
	platform: SocialPostPlatformType;
	xThreadLength: number;
	style: SocialPostStyleType;
	byokApiKey?: string;
	byokModel?: string;
} & GenerateExtrasType;

/** What the engine returns from a run — posts on success, a user-facing error on failure. */
export type GenerateResultType =
	| { ok: true; data: SocialPostsResultType; remaining: number | null }
	| { ok: false; error: string };

/** What the engine returns from regenerating one post — the rewritten post plus usage on success, an error on failure. */
export type RegenerateResultType =
	| {
			ok: true;
			post: SocialPostType;
			usage: TokenUsageType;
			remaining: number | null;
	  }
	| { ok: false; error: string };

/** Style-template CRUD surface a tool's hook exposes to the engine. */
export type StyleTemplatesApiType = {
	templates: SocialPostStyleTemplateType[];
	activeId: string | null;
	save: (name: string) => void;
	apply: (t: SocialPostStyleTemplateType) => void;
	remove: (id: string) => void;
	update: (id: string) => void;
	rename: (id: string, name: string) => void;
};

/** Run-history surface a tool's hook exposes to the engine. */
export type HistoryApiType = {
	history: SocialPostHistoryType[];
	upsert: (entry: Omit<SocialPostHistoryType, "id"> & { id?: string }) => void;
	remove: (id: string) => void;
};

/** Which conditional writer features a tool turns on. */
export type WriterFeaturesType = {
	hashtagRules: boolean;
	promptEditor: boolean;
	repurpose: boolean;
};

/** Everything the shared writer engine needs from a specific tool — injected so one engine can power several tools with isolated storage, actions, and features. */
export type WriterRuntimeType = {
	features: WriterFeaturesType;
	stores: {
		styleStorage: StoreType<SocialPostStyleType>;
		workflowStorage: StoreType<WorkflowStateType>;
		setTone: (tone: SocialPostToneType) => void;
		togglePlatform: (platform: SocialPostPlatformType) => void;
		setXThreadLength: (n: number) => void;
	};
	useStyleTemplates: () => StyleTemplatesApiType;
	useHistory: () => HistoryApiType;
	onGenerate: (params: GenerateParamsType) => Promise<GenerateResultType>;
	onRegenerate: (params: RegenerateParamsType) => Promise<RegenerateResultType>;
};
