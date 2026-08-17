// Barrel — the client-safe utils, one line per file (server-only helpers live in lib/server).
export { articleSourceIdentity, isArticleSource } from "./article-source.utils";
export { cn } from "./cn";
export { hashText } from "./hash.utils";
export {
	emitHostedUsage,
	subscribeHostedUsage,
} from "./hosted-usage-signal.utils";
export { isBrowser } from "./is-browser";
export { splitTitle } from "./text/split-title";
export { timeAgo } from "./time.utils";
export {
	CASE_GROUPS,
	convertCase,
	type CaseIdType,
	type CaseOptionType,
	type CaseGroupType,
} from "./text/case";
export { countWords, getTextCounts, type TextCountsType } from "./text/counts";
export {
	generateLorem,
	type LoremUnit,
	type LoremOptionsType,
} from "./text/lorem";
export {
	READING_WPM,
	SPEAKING_WPM,
	readingMinutes,
	durationSeconds,
	formatDuration,
	type ReadingSpeedType,
} from "./text/reading-time";
export {
	slugify,
	type SlugSeparatorType,
	type SlugOptionsType,
} from "./text/slugify";
export {
	stripXmlPreamble,
	tokenizeMarkup,
	parseAttrs,
	quoteValue,
	printMarkup,
	formatSvgMarkup,
	type IndentUnitType,
	type ParsedAttrType,
	type AttrFormatterType,
} from "./svg/format-svg";
export { svgToJsx, type SvgToJsxOptionsType } from "./svg/svg-to-jsx";
export {
	subscribeByok,
	byokStorage,
	byokModelStorage,
} from "./storage/byok-storage";
export { createHistoryStore } from "./storage/create-history-store";
export { createLocalStorageJson } from "./storage/local-storage-json";
export { createLocalStore } from "./storage/local-store";
export { normalizeHashtag } from "./writer/hashtag";
export { buildPostCopyText, buildAllPostsCopyText } from "./writer/post";
export {
	createWriterStorage,
	type WorkflowStateType,
} from "./storage/create-writer-storage";
export {
	SOCIAL_POST_DEFAULT_WORKFLOW,
	styleStorage,
	workflowStorage,
	styleTemplatesStorage,
	setTone,
	togglePlatform,
	setXThreadLength,
} from "./storage/social-posts";
