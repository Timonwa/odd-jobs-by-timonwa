"use client";
// Article to Social Posts localStorage stores — writing style, per-run workflow, and saved style templates.

import {
	SOCIAL_POST_PLATFORMS,
	SOCIAL_POST_DEFAULT_STYLE,
	MAX_SOCIAL_POST_STYLE_TEMPLATES,
	SOCIAL_POST_TONES,
} from "@/lib/constants";
import {
	createWriterStorage,
	type WorkflowStateType,
} from "./create-writer-storage";

/** First-run workflow for this tool — LinkedIn + X, single posts. */
export const SOCIAL_POST_DEFAULT_WORKFLOW: WorkflowStateType = {
	platforms: ["linkedin", "x"],
	xThreadLength: 1,
};

const stores = createWriterStorage({
	prefix: "article-to-social-posts:",
	defaultStyle: SOCIAL_POST_DEFAULT_STYLE,
	defaultWorkflow: SOCIAL_POST_DEFAULT_WORKFLOW,
	toneValues: new Set(SOCIAL_POST_TONES.map((t) => t.value)),
	platformValues: new Set(SOCIAL_POST_PLATFORMS),
	maxStyleTemplates: MAX_SOCIAL_POST_STYLE_TEMPLATES,
});

/** This tool's localStorage-backed stores and mutators, built from the shared writer engine. */
export const {
	styleStorage,
	workflowStorage,
	styleTemplatesStorage,
	setTone,
	togglePlatform,
	setXThreadLength,
} = stores;
