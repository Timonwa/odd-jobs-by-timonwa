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
	type CaseId,
	type CaseOption,
	type CaseGroup,
} from "./text/case";
export { countWords, getTextCounts, type TextCounts } from "./text/counts";
export { generateLorem, type LoremUnit, type LoremOptions } from "./text/lorem";
export {
	READING_WPM,
	SPEAKING_WPM,
	readingMinutes,
	durationSeconds,
	formatDuration,
	type ReadingSpeed,
} from "./text/reading-time";
export { slugify, type SlugSeparator, type SlugOptions } from "./text/slugify";
export {
	stripXmlPreamble,
	tokenizeMarkup,
	parseAttrs,
	quoteValue,
	printMarkup,
	formatSvgMarkup,
	type IndentUnit,
	type ParsedAttr,
	type AttrFormatter,
} from "./svg/format-svg";
export { svgToJsx, type SvgToJsxOptions } from "./svg/svg-to-jsx";
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
	type WorkflowState,
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
