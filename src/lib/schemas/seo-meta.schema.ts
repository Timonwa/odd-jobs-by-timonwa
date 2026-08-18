// Input schemas for the Article to SEO Meta Server Actions.

import { z } from "zod";

import { ArticleSourceSchema, ByokInputSchema } from "./shared.schema";

/** Keyword bound: a search phrase, not a payload. */
const PrimaryKeywordSchema = z.string().max(120).optional();

export const GenerateSeoMetaInputSchema = ByokInputSchema.extend({
	source: ArticleSourceSchema,
	primaryKeyword: PrimaryKeywordSchema,
	variationCount: z.number().int().min(1).max(3).optional(),
});

export type GenerateSeoMetaInput = z.infer<typeof GenerateSeoMetaInputSchema>;

export const RegenerateSeoMetaInputSchema = ByokInputSchema.extend({
	source: ArticleSourceSchema,
	primaryKeyword: PrimaryKeywordSchema,
	// Echoed back into the prompt so the model avoids near-duplicates. Capped at
	// the 3 variations the tool can produce, each at a generous multiple of the
	// display limits — previously an unbounded array of unbounded strings.
	existing: z
		.array(
			z.object({
				title: z.string().max(300),
				description: z.string().max(600),
			}),
		)
		.max(3),
});

export type RegenerateSeoMetaInput = z.infer<
	typeof RegenerateSeoMetaInputSchema
>;
