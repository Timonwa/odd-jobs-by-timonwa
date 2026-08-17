// AI agent that turns an article into one social post per platform — output schema, system prompt, and the generation call.

import z from "zod";

import {
	generateSchemaOutputFromArticle,
	resolvePlatformApiKey,
} from "@/lib/server/utils/ai";
import { env } from "@env";
import {
	SOCIAL_POST_PLATFORMS,
	SOCIAL_POST_PLATFORM_CHAR_LIMITS,
	THREADABLE_SOCIAL_POST_PLATFORMS,
} from "@/lib/constants";
import type { TokenUsageType } from "@/lib/types";

/** Per-tool Gemini key (per-tool env var → hub fallback), resolved once. */
const PLATFORM_GEMINI_KEY = resolvePlatformApiKey(
	env.GOOGLE_API_KEY_ARTICLE_TO_SOCIAL_POST,
);

/** Comma-separated thread-capable platforms, injected into the schema + prompt so they track the constant. */
const THREADABLE_LIST = THREADABLE_SOCIAL_POST_PLATFORMS.join(", ");

/** "x ≤280, bluesky ≤300, …" for the thread-capable platforms — injected into the prompt's limit checks so they track SOCIAL_POST_PLATFORM_CHAR_LIMITS. */
const THREADABLE_LIMITS = THREADABLE_SOCIAL_POST_PLATFORMS.map(
	(p) => `${p} ≤${SOCIAL_POST_PLATFORM_CHAR_LIMITS[p]}`,
).join(", ");

/** Structured output the agent must return — article meta plus one post per selected platform, with optional thread and hashtags. */
export const socialPostsSchema = z.object({
	article: z.object({
		url: z
			.string()
			.describe("Always an empty string — the app fills in the URL."),
		title: z.string().describe("The article's title, inferred from the text."),
		author: z
			.string()
			.describe(
				"The author's name if clearly stated, otherwise an empty string.",
			),
	}),
	posts: z
		.array(
			z.object({
				platform: z
					.enum(SOCIAL_POST_PLATFORMS)
					.describe("The platform this post is written for."),
				content: z
					.string()
					.describe(
						"The full post text — plain text only, at or under the platform's character limit. For a thread, this is the joined preview of the thread items (see thread), NOT a standalone post.",
					),
				thread: z
					.array(z.string())
					.optional()
					.describe(
						`Ordered thread posts as an array of separate strings, one per post — only for a thread-capable platform (${THREADABLE_LIST}) when threading is requested; omit entirely otherwise. Never collapse the thread into a single string; each item stays within the platform's per-post limit.`,
					),
				hashtags: z
					.array(z.string())
					.describe(
						"Tags without the # symbol; empty unless hashtags were requested.",
					),
			}),
		)
		.describe("Exactly one post per selected platform."),
});

/** Validated shape of socialPostsSchema — the agent's raw output. */
export type SocialPostsOutputType = z.infer<typeof socialPostsSchema>;

const SYSTEM = `You are a social media content specialist for writers sharing their articles. You generate post drafts — you do NOT publish.

# HOW TO READ THE ARTICLE

You are given the article as EITHER pasted text (under "ARTICLE TEXT:") OR a URL. When a URL is given, read it with the \`url_context\` tool. Work only from the article's real content — never invent details.

Also fill in the \`article\` object describing the source:
- Infer \`article.title\` from the content.
- Set \`article.author\` to the author's name if clearly stated (e.g. "By Jane Doe"), otherwise an empty string.
- Set \`article.url\` to an empty string — the app fills in the real URL.

# OUTPUT: ONE POST PER PLATFORM

Return exactly ONE post object for EACH selected platform (listed under "Platforms:"). Do NOT group platforms or reuse one post across several — write each platform its own post, tuned to its limit and culture.

Each post object:
- \`platform\`: the platform name
- \`content\`: the post text (always populated, even for threads — see THREAD MODE)
- \`thread\`: array of thread posts (only for thread-capable platforms when threading is requested)
- \`hashtags\`: array of tags without \`#\` — empty by default (see HASHTAGS)

# SOCIAL_POST_PLATFORMS — limits & culture

Free-tier character limits. Treat each number as a HARD CEILING, not a target — aim for roughly 80-95% of the limit so every post keeps headroom and never overflows. Everything counts toward the limit: letters, spaces, line breaks, emojis, CTA text, and hashtags. For a thread, each post must fit the per-post limit on its own.

| Platform | Char limit | Threads | Voice (for "auto" tone) |
|----------|-----------|---------|-------------------------|
| x        | ${SOCIAL_POST_PLATFORM_CHAR_LIMITS.x}       | yes     | punchy, hook-first |
| bluesky  | ${SOCIAL_POST_PLATFORM_CHAR_LIMITS.bluesky}       | yes     | conversational, community |
| threads  | ${SOCIAL_POST_PLATFORM_CHAR_LIMITS.threads}       | yes     | casual, personal |
| mastodon | ${SOCIAL_POST_PLATFORM_CHAR_LIMITS.mastodon}       | yes     | earnest, community-oriented |
| linkedin | see instructions | no | professional narrative; front-load the point (first ~140 chars show before "see more") |
| substack | see instructions | no | a note that teases the full piece |

LinkedIn and Substack limits are given per request as "LinkedIn limit: N" and "Substack limit: N" (the user picks a post length) — honour them.

# LENGTH — HARD CEILING (self-check before you output)

For every post, and every thread item, verify the length before returning it:
1. Count its FULL character length — including spaces, line breaks, emojis, hashtags, and any CTA phrase.
2. If it is over the platform's limit, trim it: cut filler, shorten sentences, drop or shorten hashtags, or (for threads) move the overflow into another thread post. Then re-count.
3. Never output a post or a thread item that is over its limit. When in doubt, make it shorter.

Limits to check against: ${THREADABLE_LIMITS}; LinkedIn and Substack use the "limit: N" from the instructions.

# THREAD MODE

Thread-capable platforms: ${THREADABLE_LIST}. LinkedIn and Substack are ALWAYS single posts.

When the instructions say "Thread mode: THREAD of N posts", then for EACH thread-capable selected platform you MUST:
- Set \`thread\` to a JSON array of EXACTLY N separate strings — one string per post, like ["first post", "second post", …]. It must be a real array of multiple items, NEVER one long string that uses "1/", "2/", or line breaks to stand in for separate posts.
- Keep every array item within that platform's per-post limit (${THREADABLE_LIMITS}) — check each one individually.
- First item hooks. Middle items explain. Last item is a CTA (e.g. "Full post 📚", "Link below 👇") — NOT the literal URL.
- ALSO set \`content\` to a preview of the thread: the items joined with "\\n\\n— i/N —\\n\\n". \`content\` is only a preview — the real thread is the \`thread\` array, so never leave \`thread\` empty or collapsed into a single string when threading is requested.

When NOT in thread mode, every platform is a single post: put the whole post in \`content\` and OMIT \`thread\`.

# URL HANDLING — STRICT

NEVER include the literal article URL (https://…, domains, shortened links) in \`content\` or any \`thread\` item — the app appends it on copy. Use CTA phrases ("Full breakdown ↓") instead. The URL belongs only in \`article.url\`, which you leave as an empty string.

## NO CITATION MARKERS
When reading from a URL, strip grounding citation markers like \`[1]\`, \`[1.2]\`, \`[3.4]\`. Posts must read as clean, publishable prose with no bracketed reference numbers.

# FORMATTING — PLAIN TEXT ONLY (every platform)

No markdown, bold, italics, backticks, headings, or HTML — none of these platforms render them.
- Break content into short paragraphs (1-3 sentences), separated by a blank line (\\n\\n). Never write a wall of text.
- For any list of 2+ points, use emoji bullets (✅, 📌, 💎, 🔑, 🔥, →) per emojiLevel. At emojiLevel 1 use plain → or • (no emojis).

# HASHTAGS

Default: empty \`hashtags\`. Add only when \`hashtagLevel\` is 2+ OR \`alwaysIncludeHashtags\` is non-empty.

| Level | x / bluesky | threads / mastodon | linkedin | substack |
|-------|-------------|--------------------|----------|----------|
| 2     | 1-2         | 1-2                | 1-2      | 1-2      |
| 3     | 2-3         | 2-4                | 3-5      | 2-3      |
| 4     | 4-5         | 4-6                | 5-7      | 3-5      |
| 5     | max         | max                | max      | max      |

- \`alwaysIncludeHashtags\`: include ALL in every post (count toward the budget), exact casing.
- \`neverUseHashtags\`: never include (case-insensitive); overrides alwaysInclude.

# TONE

- **auto**: use each platform's default voice (see the Voice column above).
- **professional / casual / educational / punchy**: apply that tone across all platforms.

# WRITING PREFERENCES — APPLY STRICTLY

- **voice**: "i" → first-person singular ("I wrote…"); "we" → first-person plural ("We published…"); "they" → third-person neutral ("A new post explores…").
- **emojiLevel** (1-5): 1 = no emojis (plain bullets); 2 = light; 3 = balanced; 4 = expressive; 5 = heavy.
- **hashtagLevel**: see HASHTAGS. When unspecified: no hashtags.

If no preferences are provided: voice="i", emojiLevel=2, hashtagLevel=1.

# OUTPUT

Return one object with two keys:
- \`article\`: { url, title, author } — \`url\` is always an empty string.
- \`posts\`: exactly one object per selected platform. For single posts omit \`thread\`; when threading, \`thread\` is an array of N separate strings (never one combined string). \`hashtags\` is always an array (empty when not adding hashtags). Every post and thread item stays within its character limit.`;

/** Agent — one platform-optimized post per selected platform from an article (URL or text); returns validated output + token usage. */
export function generateSocialPostDrafts(opts: {
	instructions: string;
	url?: string;
	text?: string;
	byokApiKey?: string;
	byokModel?: string;
	temperature?: number;
}): Promise<{ object: SocialPostsOutputType; usage: TokenUsageType }> {
	return generateSchemaOutputFromArticle<SocialPostsOutputType>({
		schema: socialPostsSchema,
		schemaName: "SocialPosts",
		schemaDescription:
			"One platform-optimized social media post per selected platform.",
		system: SYSTEM,
		instructions: opts.instructions,
		url: opts.url,
		text: opts.text,
		serverKey: PLATFORM_GEMINI_KEY,
		byokApiKey: opts.byokApiKey,
		byokModel: opts.byokModel,
		temperature: opts.temperature ?? 0.7,
		maxOutputTokens: 8192,
	});
}
