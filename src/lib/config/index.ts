// Barrel — the app's client-safe settings.
//
// `env.ts` is deliberately absent: it is `server-only`, and re-exporting it here
// would let a client component reach server-only code through an otherwise
// client-safe barrel. It keeps its own `@env` alias for that reason.
export {
	BYOK_MODELS,
	DEFAULT_BYOK_MODEL,
	HOSTED_LLM_MODEL,
	type ByokModel,
} from "./byok";
export {
	TOOL_CATEGORIES,
	getCategory,
	type CategoryId,
	type Category,
	type CategoryColor,
} from "./categories";
export { ROUTES } from "./routes";
export * from "./site";
export {
	TINTS,
	TINT_SURFACE,
	TINT_ICON,
	TINT_TEXT,
	TINT_BORDER,
	TINT_HOVER_BORDER,
	type Tint,
} from "./tints";
export {
	TOOLS,
	LIVE_TOOLS,
	FEATURED_TOOLS,
	getPrimaryCategoryId,
	getToolsInCategory,
	getToolBySlug,
	getRelatedTools,
	type Tool,
} from "./tools";
