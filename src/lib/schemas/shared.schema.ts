// Cross-domain primitives for Server Action inputs.
//
// A Server Action is an ordinary POST endpoint: anything typed in its signature
// is a hint to the compiler, not a guarantee at runtime. Every field a client
// can send is bounded here, because the daily quota counts *requests* — so
// without per-field limits one allowed request can carry megabytes to Gemini on
// the platform key, and steer it as a general-purpose model.

import { z } from "zod";

import { BYOK_MODELS } from "@/lib/config/byok";
import { MAX_ARTICLE_INPUT_CHARS } from "@/lib/constants";

/** Where a tool reads the article from. `text` carries the same cap the UI shows; `url` is length-bounded before the SSRF check runs on it. */
export const ArticleSourceSchema = z.discriminatedUnion("kind", [
	z.object({ kind: z.literal("url"), url: z.string().url().max(2048) }),
	z.object({
		kind: z.literal("text"),
		text: z.string().min(1).max(MAX_ARTICLE_INPUT_CHARS),
	}),
]);

const BYOK_MODEL_VALUES = BYOK_MODELS.map((model) => model.value) as [
	string,
	...string[],
];

/** The two BYOK fields every AI action accepts. The model is allowlisted again downstream; bounding the key here keeps an oversized body from reaching the provider. */
export const ByokInputSchema = z.object({
	// Google API keys are ~39 chars of URL-safe base64; the bound is generous
	// without admitting a payload.
	byokApiKey: z
		.string()
		.min(20)
		.max(200)
		.regex(/^[A-Za-z0-9_-]+$/)
		.optional(),
	byokModel: z.enum(BYOK_MODEL_VALUES).optional(),
});
