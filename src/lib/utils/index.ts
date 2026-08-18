// Barrel — the client-safe utils, one line per file (server-only helpers live in lib/server).
export { toActionCallErrorMessage } from "./action-error.utils";
export { articleSourceIdentity, isArticleSource } from "./article-source.utils";
export { cn } from "./cn";
export { hashText } from "./hash.utils";
export {
	emitHostedUsage,
	subscribeHostedUsage,
} from "./hosted-usage-signal.utils";
export { buildItemListJsonLd, ogImageUrl } from "./json-ld.utils";
export { isBrowser } from "./is-browser.utils";
export { splitTitle } from "./text/split-title.utils";
export { timeAgo } from "./time.utils";
export { buildToolMetadata, buildToolJsonLd } from "./tool-seo.utils";
export {
	CASE_GROUPS,
	convertCase,
	type CaseId,
	type CaseOption,
	type CaseGroup,
} from "./text/case.utils";
export {
	countWords,
	getTextCounts,
	type TextCounts,
} from "./text/counts.utils";
export {
	generateLorem,
	type LoremUnit,
	type LoremOptions,
} from "./text/lorem.utils";
export {
	READING_WPM,
	SPEAKING_WPM,
	readingMinutes,
	durationSeconds,
	formatDuration,
	type ReadingSpeed,
} from "./text/reading-time.utils";
export {
	slugify,
	type SlugSeparator,
	type SlugOptions,
} from "./text/slugify.utils";
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
} from "./svg/format.utils";
export { svgToJsx, type SvgToJsxOptions } from "./svg/svg-to-jsx.utils";
export {
	subscribeByok,
	byokStorage,
	byokModelStorage,
} from "./storage/byok.utils";
export { createHistoryStore } from "./storage/create-history-store.utils";
export { createLocalStorageJson } from "./storage/local-storage-json.utils";
export { createLocalStore } from "./storage/local-store.utils";
export { normalizeHashtag } from "./writer/hashtag.utils";
export { buildPostCopyText, buildAllPostsCopyText } from "./writer/post.utils";
export {
	createWriterStorage,
	type WorkflowState,
} from "./storage/create-writer-storage.utils";
export {
	SOCIAL_POST_DEFAULT_WORKFLOW,
	styleStorage,
	workflowStorage,
	styleTemplatesStorage,
	setTone,
	togglePlatform,
	setXThreadLength,
} from "./storage/social-posts.utils";
export { createToolHistory } from "./writer/create-tool-history.utils";
export { createSocialPostsStyleTemplates } from "./writer/create-social-posts-style-templates.utils";
