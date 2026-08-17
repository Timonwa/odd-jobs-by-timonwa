"use client";
// Factory that builds a writer tool's localStorage stores (style, workflow, style templates) and mutators.

import type {
	SocialPostDensityLevelType,
	SocialPostPlatformType,
	SocialPostToneType,
} from "@/lib/constants";
import type {
	SocialPostStyleTemplateType,
	SocialPostStyleType,
} from "@/lib/types";
import { createLocalStore } from "@/lib/utils/storage/local-store";

/** Per-run workflow shared by article-generator tools — targets and structure, remembered as last-used (never part of a style template). */
export type WorkflowStateType = {
	platforms: SocialPostPlatformType[];
	xThreadLength: number;
};

type WriterStorageOptionsType = {
	prefix: string;
	defaultStyle: SocialPostStyleType;
	defaultWorkflow: WorkflowStateType;
	toneValues: ReadonlySet<SocialPostToneType>;
	platformValues: ReadonlySet<SocialPostPlatformType>;
	maxStyleTemplates: number;
};

/** Builds a tool's localStorage-backed stores under a `prefix`, so two tools that share the writer engine keep isolated style, workflow, and style templates. */
export function createWriterStorage(opts: WriterStorageOptionsType) {
	const {
		prefix,
		defaultStyle,
		defaultWorkflow,
		toneValues,
		platformValues,
		maxStyleTemplates,
	} = opts;

	const STYLE_KEY = `${prefix}writing-style`;
	const WORKFLOW_KEY = `${prefix}workflow`;
	const TEMPLATES_KEY = `${prefix}style-templates`;

	// Style persists across sessions — not secrets.
	const readStyle = (): SocialPostStyleType => {
		try {
			const raw = window.localStorage.getItem(STYLE_KEY);
			if (!raw) return defaultStyle;
			const parsed = JSON.parse(raw) as Partial<SocialPostStyleType>;
			return {
				voice: parsed.voice ?? defaultStyle.voice,
				tone:
					typeof parsed.tone === "string" &&
					toneValues.has(parsed.tone as SocialPostToneType)
						? (parsed.tone as SocialPostToneType)
						: defaultStyle.tone,
				emojiLevel:
					(parsed.emojiLevel as SocialPostDensityLevelType) ??
					defaultStyle.emojiLevel,
				hashtagLevel:
					(parsed.hashtagLevel as SocialPostDensityLevelType) ??
					defaultStyle.hashtagLevel,
				alwaysIncludeHashtags: Array.isArray(parsed.alwaysIncludeHashtags)
					? parsed.alwaysIncludeHashtags.filter(
							(s): s is string => typeof s === "string",
						)
					: defaultStyle.alwaysIncludeHashtags,
				neverUseHashtags: Array.isArray(parsed.neverUseHashtags)
					? parsed.neverUseHashtags.filter(
							(s): s is string => typeof s === "string",
						)
					: defaultStyle.neverUseHashtags,
				postLength:
					parsed.postLength === "short" ||
					parsed.postLength === "medium" ||
					parsed.postLength === "long"
						? parsed.postLength
						: defaultStyle.postLength,
			};
		} catch {
			return defaultStyle;
		}
	};

	const styleStorage = createLocalStore<SocialPostStyleType>({
		read: readStyle,
		write: (style) => {
			try {
				window.localStorage.setItem(STYLE_KEY, JSON.stringify(style));
			} catch {}
		},
		serverValue: defaultStyle,
	});

	const readWorkflow = (): WorkflowStateType => {
		try {
			const raw = window.localStorage.getItem(WORKFLOW_KEY);
			if (!raw) return defaultWorkflow;
			const parsed = JSON.parse(raw) as Partial<WorkflowStateType>;
			const platforms = Array.isArray(parsed.platforms)
				? (parsed.platforms.filter(
						(p): p is SocialPostPlatformType =>
							typeof p === "string" &&
							platformValues.has(p as SocialPostPlatformType),
					) as SocialPostPlatformType[])
				: defaultWorkflow.platforms;
			const xThreadLength =
				typeof parsed.xThreadLength === "number" &&
				Number.isFinite(parsed.xThreadLength)
					? Math.max(1, Math.floor(parsed.xThreadLength))
					: defaultWorkflow.xThreadLength;
			return {
				platforms: platforms.length > 0 ? platforms : defaultWorkflow.platforms,
				xThreadLength,
			};
		} catch {
			return defaultWorkflow;
		}
	};

	const workflowStorage = createLocalStore<WorkflowStateType>({
		read: readWorkflow,
		write: (state) => {
			try {
				window.localStorage.setItem(WORKFLOW_KEY, JSON.stringify(state));
			} catch {}
		},
		serverValue: defaultWorkflow,
	});

	// Tone lives in the style store — read the latest at call time so there's no stale closure.
	const setTone = (tone: SocialPostToneType) =>
		styleStorage.set({ ...styleStorage.get(), tone });

	const togglePlatform = (platform: SocialPostPlatformType) => {
		const current = workflowStorage.get();
		const platforms = current.platforms.includes(platform)
			? current.platforms.filter((p) => p !== platform)
			: [...current.platforms, platform];
		workflowStorage.set({ ...current, platforms });
	};

	const setXThreadLength = (xThreadLength: number) =>
		workflowStorage.set({ ...workflowStorage.get(), xThreadLength });

	const EMPTY_TEMPLATES: SocialPostStyleTemplateType[] = [];

	// Drop entries lacking a `style` object — old presets bundled workflow and no longer fit this shape.
	const readTemplates = (): SocialPostStyleTemplateType[] => {
		try {
			const raw = window.localStorage.getItem(TEMPLATES_KEY);
			if (!raw) return EMPTY_TEMPLATES;
			const parsed = JSON.parse(raw) as unknown;
			if (!Array.isArray(parsed)) return EMPTY_TEMPLATES;
			return parsed.filter(
				(t): t is SocialPostStyleTemplateType =>
					!!t &&
					typeof t === "object" &&
					typeof (t as SocialPostStyleTemplateType).id === "string" &&
					!!(t as SocialPostStyleTemplateType).style &&
					typeof (t as SocialPostStyleTemplateType).style === "object",
			);
		} catch {
			return EMPTY_TEMPLATES;
		}
	};

	const styleTemplatesStorage = createLocalStore<SocialPostStyleTemplateType[]>(
		{
			read: readTemplates,
			write: (items) => {
				try {
					window.localStorage.setItem(
						TEMPLATES_KEY,
						JSON.stringify(items.slice(0, maxStyleTemplates)),
					);
				} catch {}
			},
			serverValue: EMPTY_TEMPLATES,
		},
	);

	return {
		styleStorage,
		workflowStorage,
		styleTemplatesStorage,
		setTone,
		togglePlatform,
		setXThreadLength,
	};
}
