// Per-tool SEO copy — the single source for each tool's route metadata and
// its WebApplication JSON-LD. Previously this lived inline in nine near-identical
// route layouts, which left tool copy with several competing sources of truth.

export type ToolSeo = {
	/** `<title>`, and the JSON-LD/OpenGraph title. */
	title: string;
	description: string;
	/** Display name for `applicationName` and JSON-LD `name`. */
	applicationName: string;
	alternateName?: string;
	applicationSubCategory: string;
	keywords: string[];
	featureList: string[];
};

export const TOOL_SEO: Record<string, ToolSeo> = {
	"article-to-seo-meta": {
		title: "Article to SEO Meta — titles & descriptions in spec",
		description:
			"Paste an article URL or text and get 1-3 SEO title and description variations sized to Google's limits (50-60 / 150-160 chars), each with your keyword.",
		applicationName: "Article to SEO Meta",
		alternateName: "SEO Meta Generator",
		applicationSubCategory: "SEO tool",
		keywords: [
			"SEO title generator",
			"SEO meta description generator",
			"meta description 160 characters",
			"SEO title 60 characters",
			"article to SEO",
			"URL to SEO meta tags",
			"primary keyword in title",
			"open source SEO tool",
		],
		featureList: [
			"Generate 1-3 SEO title + description variations from an article URL or pasted text",
			"Strict character ranges: titles 50-60, descriptions 150-160",
			"Optional primary keyword included in every variation",
			"Per-field character counter with in-range, close, or out-of-range indicators",
			"Regenerate a single variation for a fresh angle",
			"Edit variations inline and copy title, description, or both in one click",
			"Open source",
		],
	},
	"article-to-social-posts": {
		title: "Article to Social Posts — a post for each network",
		description:
			"Turn an article URL or draft into a post tuned for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack — with tone, hashtag, and thread controls. Free.",
		applicationName: "Article to Social Posts",
		alternateName: "Article to Social",
		applicationSubCategory: "Social media content tool",
		keywords: [
			"article to social",
			"social media post generator",
			"article to tweet",
			"article to LinkedIn",
			"AI social media writer",
			"multi-platform social posts",
			"X thread generator",
			"Bluesky post generator",
			"Threads post generator",
			"Mastodon post generator",
			"Substack Notes generator",
			"open source writer tool",
			"bring your own key",
			"Gemini API",
		],
		featureList: [
			"Paste an article URL or its text",
			"One post tailored to each network: X, LinkedIn, Threads, Bluesky, Mastodon, and Substack",
			"Free-tier character limits per platform (X 280, Bluesky 300, Threads and Mastodon 500)",
			"Post length control for the longer-form networks (LinkedIn and Substack)",
			"Tone control: auto, professional, casual, educational, punchy",
			"Voice, emoji density, and hashtag density preferences",
			"Multi-post threads for X, Bluesky, Threads, and Mastodon",
			"Custom always-include and never-use hashtag rules",
			"Save reusable presets of your tone, platforms, and writing style",
			"Regenerate a single platform's post without re-fetching",
			"Edit posts inline with live character counters",
			"Local history across sessions",
			"Bring Your Own Key (Google AI Studio / Gemini) for unlimited use",
			"Copy-only by design — no OAuth, no publishing credentials stored",
			"Open source",
		],
	},
	"case-converter": {
		title: "Case Converter — UPPERCASE, camelCase & 15 more",
		description:
			"Convert text between UPPERCASE, Title Case, camelCase, snake_case, kebab-case, and more — instantly, with one-click copy. Runs entirely in your browser.",
		applicationName: "Case Converter",
		alternateName: "Text Case Converter",
		applicationSubCategory: "Text tool",
		keywords: [
			"case converter",
			"uppercase to lowercase",
			"title case converter",
			"camelCase converter",
			"snake_case converter",
			"sentence case",
			"open source case converter",
		],
		featureList: [
			"Convert to UPPERCASE, lowercase, Title Case, and Sentence case",
			"Programmer cases: camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case",
			"Alternating and inverse case",
			"One-click copy, live preview",
			"Runs entirely in your browser — nothing is uploaded",
			"Open source",
		],
	},
	"hash-generator": {
		title: "Hash Generator — SHA-1, SHA-256, SHA-384, SHA-512",
		description:
			"Hash text with SHA-1, SHA-256, SHA-384, and SHA-512 instantly. Computed locally with the Web Crypto API — your text never leaves the browser.",
		applicationName: "Hash Generator",
		alternateName: "SHA Hash Generator",
		applicationSubCategory: "Developer tool",
		keywords: [
			"hash generator",
			"sha256 generator",
			"sha-256 hash",
			"sha1 generator",
			"sha512 generator",
			"online hash tool",
			"open source hash generator",
		],
		featureList: [
			"Hash text with SHA-1, SHA-256, SHA-384, and SHA-512",
			"Digests update as you type",
			"Lowercase or uppercase hex output",
			"One-click copy for each hash",
			"Computed locally with the Web Crypto API — nothing is uploaded",
			"Open source",
		],
	},
	"lorem-ipsum": {
		title: "Lorem Ipsum Generator — placeholder text in one click",
		description:
			"Generate lorem ipsum placeholder text by the paragraph, sentence, or word. Pick how much, regenerate for a fresh batch, and copy it into your mockup. Runs in your browser.",
		applicationName: "Lorem Ipsum Generator",
		alternateName: "Placeholder Text Generator",
		applicationSubCategory: "Developer tool",
		keywords: [
			"lorem ipsum",
			"lorem ipsum generator",
			"placeholder text",
			"dummy text generator",
			"filler text",
			"lipsum",
			"open source lorem ipsum generator",
		],
		featureList: [
			"Generate lorem ipsum by paragraph, sentence, or word",
			"Choose exactly how much text to produce",
			"Start with the classic “Lorem ipsum dolor sit amet…” or not",
			"Regenerate for a fresh batch",
			"One-click copy",
			"Runs entirely in your browser — nothing is uploaded",
			"Open source",
		],
	},
	"reading-time": {
		title: "Reading Time Estimator — how long an article takes to read",
		description:
			"Paste an article for its reading and speaking time, with adjustable speed and a copy-ready “X min read” label. Free, no sign-up, runs in your browser.",
		applicationName: "Reading Time Estimator",
		alternateName: "Reading Time Calculator",
		applicationSubCategory: "Text tool",
		keywords: [
			"reading time estimator",
			"reading time calculator",
			"how long to read",
			"words per minute",
			"speaking time calculator",
			"min read label",
			"open source reading time",
		],
		featureList: [
			"Estimate reading and speaking time from any text",
			"Adjustable reading speed (slow, average, fast)",
			"Copy-ready “X min read” label for blog posts",
			"Runs entirely in your browser — nothing is uploaded",
			"Open source",
		],
	},
	"slug-generator": {
		title: "Slug Generator — turn any text into a clean URL slug",
		description:
			"Turn any title or heading into a clean, URL-safe slug — strips accents and punctuation, with separator, lowercase, and stop-word options. Runs in your browser.",
		applicationName: "Slug Generator",
		alternateName: "URL Slug Generator",
		applicationSubCategory: "SEO tool",
		keywords: [
			"slug generator",
			"url slug generator",
			"title to slug",
			"text to slug",
			"seo slug",
			"permalink generator",
			"open source slug generator",
		],
		featureList: [
			"Turn any title, heading, or text into a clean, URL-safe slug",
			"Strips accents and punctuation",
			"Choose a hyphen or underscore separator",
			"Optional lowercasing and stop-word removal",
			"One-click copy, live preview",
			"Runs entirely in your browser — nothing is uploaded",
			"Open source",
		],
	},
	"svg-to-jsx": {
		title: "SVG to JSX Converter — turn SVG into a React component",
		description:
			"Convert raw SVG markup into clean React/JSX — attributes renamed to their React names, inline styles turned into objects, optionally wrapped in a typed component. Runs in your browser.",
		applicationName: "SVG to JSX Converter",
		alternateName: "SVG to React Converter",
		applicationSubCategory: "Developer tool",
		keywords: [
			"svg to jsx",
			"svg to react",
			"svg to react component",
			"convert svg to jsx",
			"svg jsx converter",
			"react svg component",
			"open source svg to jsx",
		],
		featureList: [
			"Convert raw SVG markup into clean JSX",
			"Rename attributes to their React names (class → className, kebab-case → camelCase)",
			"Turn inline style strings into style objects",
			"Optionally wrap the SVG in a typed React component",
			"Spread props onto the root <svg>",
			"One-click copy",
			"Runs entirely in your browser — nothing is uploaded",
			"Open source",
		],
	},
	"word-counter": {
		title: "Word & Character Counter — reading time & limits",
		description:
			"Count words, characters, sentences, and paragraphs as you type, with reading time and live limits for SEO titles, meta descriptions, and social posts.",
		applicationName: "Word & Character Counter",
		alternateName: "Word Counter",
		applicationSubCategory: "Text tool",
		keywords: [
			"word counter",
			"character counter",
			"count words online",
			"meta description character count",
			"tweet character count",
			"reading time calculator",
			"open source word counter",
		],
		featureList: [
			"Live word, character, sentence, paragraph, and line counts",
			"Reading and speaking time estimates",
			"Live character limits for SEO titles, meta descriptions, X, Bluesky, and LinkedIn",
			"Runs entirely in your browser — nothing is uploaded",
			"Open source",
		],
	},
};
