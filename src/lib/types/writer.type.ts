// Types for the shared writer engine — the runtime contract, generation params, and results.

import type { SocialPostPlatform, SocialPostTone } from "@/lib/constants";
import type {
	ArticleSource,
	SocialPostHistory,
	SocialPost,
	SocialPostStyleTemplate,
	SocialPostsResult,
	TokenUsage,
	SocialPostStyle,
} from "@/lib/types";
import type { WorkflowState } from "@/lib/utils";

/** Minimal external-store shape (useSyncExternalStore-compatible) the engine reads and writes. */
type Store<T> = {
	get: () => T;
	set: (value: T) => void;
	subscribe: (cb: () => void) => () => void;
	getSnapshot: () => T;
	getServerSnapshot: () => T;
};

/** Extras a tool may add to a generation request (populated by conditional form controls). */
export type GenerateExtras = {
	prompt?: string;
	variantCount?: number;
};

/** Inputs for a full generation run — article, target platforms, thread length, writing style, and optional BYOK credentials. */
export type GenerateParams = {
	source: ArticleSource;
	platforms: SocialPostPlatform[];
	xThreadLength: number;
	style: SocialPostStyle;
	byokApiKey?: string;
	byokModel?: string;
} & GenerateExtras;

/** Inputs for regenerating a single platform's post. */
export type RegenerateParams = {
	source: ArticleSource;
	platform: SocialPostPlatform;
	xThreadLength: number;
	style: SocialPostStyle;
	byokApiKey?: string;
	byokModel?: string;
} & GenerateExtras;

/** What the engine returns from a run — posts on success, a user-facing error on failure. */
export type GenerateResult =
	| { ok: true; data: SocialPostsResult; remaining: number | null }
	| { ok: false; error: string };

/** What the engine returns from regenerating one post — the rewritten post plus usage on success, an error on failure. */
export type RegenerateResult =
	| {
			ok: true;
			post: SocialPost;
			usage: TokenUsage;
			remaining: number | null;
	  }
	| { ok: false; error: string };

/** Style-template CRUD surface a tool's hook exposes to the engine. */
export type StyleTemplatesApi = {
	templates: SocialPostStyleTemplate[];
	activeId: string | null;
	save: (name: string) => void;
	apply: (t: SocialPostStyleTemplate) => void;
	remove: (id: string) => void;
	update: (id: string) => void;
	rename: (id: string, name: string) => void;
};

/** Run-history surface a tool's hook exposes to the engine. */
export type HistoryApi = {
	history: SocialPostHistory[];
	upsert: (entry: Omit<SocialPostHistory, "id"> & { id?: string }) => void;
	remove: (id: string) => void;
};

/** Which conditional writer features a tool turns on. */
export type WriterFeatures = {
	hashtagRules: boolean;
	promptEditor: boolean;
	repurpose: boolean;
};

/** Everything the shared writer engine needs from a specific tool — injected so one engine can power several tools with isolated storage, actions, and features. */
export type WriterRuntime = {
	features: WriterFeatures;
	stores: {
		styleStorage: Store<SocialPostStyle>;
		workflowStorage: Store<WorkflowState>;
		setTone: (tone: SocialPostTone) => void;
		togglePlatform: (platform: SocialPostPlatform) => void;
		setXThreadLength: (n: number) => void;
	};
	useStyleTemplates: () => StyleTemplatesApi;
	useHistory: () => HistoryApi;
	onGenerate: (params: GenerateParams) => Promise<GenerateResult>;
	onRegenerate: (params: RegenerateParams) => Promise<RegenerateResult>;
};
