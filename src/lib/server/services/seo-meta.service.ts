// AI agent that produces SEO title/description variations for an article — output schema, system prompt, and the generation call.

import z from "zod";

import {
	generateSchemaOutputFromArticle,
	resolvePlatformApiKey,
} from "@/lib/server/utils/ai";
import { env } from "@env";
import {
	SEO_META_DESC_MAX,
	SEO_META_DESC_MIN,
	SEO_META_TITLE_MAX,
	SEO_META_TITLE_MIN,
} from "@/lib/constants";
import type { TokenUsageType } from "@/lib/types";

/** Per-tool Gemini key (per-tool env var → hub fallback), resolved once. */
const PLATFORM_GEMINI_KEY = resolvePlatformApiKey(
	env.GOOGLE_API_KEY_ARTICLE_TO_SEO_META,
);

// Char-length ranges + midpoint targets, injected into the schema + prompt so they track the SEO_META_* constants.
const TITLE_RANGE = `${SEO_META_TITLE_MIN}-${SEO_META_TITLE_MAX}`;
const DESC_RANGE = `${SEO_META_DESC_MIN}-${SEO_META_DESC_MAX}`;
const TITLE_TARGET = Math.round((SEO_META_TITLE_MIN + SEO_META_TITLE_MAX) / 2);
const DESC_TARGET = Math.round((SEO_META_DESC_MIN + SEO_META_DESC_MAX) / 2);

/** Structured output the agent must return — article meta plus 1-3 SEO title/description variations. */
export const seoMetaSchema = z.object({
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
	variations: z
		.array(
			z.object({
				title: z
					.string()
					.describe(
						`SEO meta title, ${TITLE_RANGE} characters. No surrounding quotes, no brand/site suffix, no trailing punctuation.`,
					),
				description: z
					.string()
					.describe(
						`SEO meta description, ${DESC_RANGE} characters. Includes the primary keyword when one is given.`,
					),
			}),
		)
		.min(1)
		.max(3)
		.describe(
			"One entry per requested variation, each approaching the article from a distinct angle (benefit / problem / curiosity).",
		),
});

/** Validated shape of seoMetaSchema — the agent's raw output. */
export type SeoMetaOutputType = z.infer<typeof seoMetaSchema>;

const SYSTEM = `You are an SEO specialist writing meta tags for articles.

# HOW TO READ THE ARTICLE

You are given the article as EITHER pasted text (under "ARTICLE TEXT:") OR a URL. When a URL is given, read it with the \`url_context\` tool and work only from the article's real content — never invent details or write about a topic you couldn't read.

Also fill in the \`article\` object describing the source:
- Infer \`article.title\` from the content.
- Set \`article.author\` to the author's name if clearly stated (e.g. "By Jane Doe"), otherwise an empty string.
- Set \`article.url\` to an empty string — the app fills in the real URL.

# TASK

Generate N variations of SEO meta tags, where N matches the requested \`variationCount\` (1-3). Each variation is a { title, description } pair.

# CHARACTER LIMITS (HARD REQUIREMENT)

- **title**: ${TITLE_RANGE} characters. Aim for ${TITLE_TARGET}.
- **description**: ${DESC_RANGE} characters. Aim for ${DESC_TARGET}.

## MANDATORY SELF-CHECK — do this for every variation before outputting:

1. Count the exact character length of your title.
2. If it is below ${SEO_META_TITLE_MIN}: add more words. If it is above ${SEO_META_TITLE_MAX}: shorten by cutting filler words, weak adjectives, or restating the same idea twice.
3. Count the exact character length of your description.
4. If it is below ${SEO_META_DESC_MIN}: expand with a specific benefit, audience, or outcome. If it is above ${SEO_META_DESC_MAX}: cut non-essential clauses or qualifying phrases.
5. Re-count after every edit. Do not output until both values are inside the target range.

A title or description even 1 character outside ${TITLE_RANGE} / ${DESC_RANGE} must be rewritten before output. Do not guess the length — count character by character.

# PRIMARY KEYWORD

The user may provide a \`primaryKeyword\`. When provided:
- Include it in EVERY title and EVERY description.
- Position it in the first half of the string when the sentence allows, without sounding forced.
- Exactly ONE natural occurrence per tag — no stuffing.

When no keyword is provided, optimize for the article's natural main topic.

# VARIETY

When generating 2-3 variations, each must approach the article from a DIFFERENT angle so the user has real choices:
- benefit-led (what the reader gains)
- problem-led (what the reader avoids or solves)
- curiosity-led (what surprises or intrigues)

Pick the angles that best fit the article. If only 1 is requested, pick the strongest angle.

# VOICE

Match the article's language and register. Professional article → professional tag. Casual blog → casual tag. Write in the article's language.

# WRITE CLEAN

- No quotes around the title.
- No emojis unless the article is clearly casual.
- No trailing "..." or "!".
- No hashtags.
- No brand/site suffixes (e.g., " | MyBlog") — the platform appends those.
- No citation markers like [1] or [1.2] — when reading from a URL, strip any bracketed source numbers.
- Titles are complete phrases, not fragments.`;

/** Agent — generate 1-3 validated SEO { title, description } variations from a draft (URL or text). */
export function generateSeoMetaVariations(opts: {
	instructions: string;
	url?: string;
	text?: string;
	byokApiKey?: string;
	byokModel?: string;
}): Promise<{ object: SeoMetaOutputType; usage: TokenUsageType }> {
	return generateSchemaOutputFromArticle<SeoMetaOutputType>({
		schema: seoMetaSchema,
		schemaName: "SeoMetaVariations",
		schemaDescription:
			"Search-optimized title + description variations sized to Google's display limits.",
		system: SYSTEM,
		instructions: opts.instructions,
		url: opts.url,
		text: opts.text,
		serverKey: PLATFORM_GEMINI_KEY,
		byokApiKey: opts.byokApiKey,
		byokModel: opts.byokModel,
		// Low-ish temperature: the character-count limits are a hard requirement,
		// so we favour consistency over surprise. Variety comes from the prompt.
		temperature: 0.5,
		maxOutputTokens: 2048,
	});
}
