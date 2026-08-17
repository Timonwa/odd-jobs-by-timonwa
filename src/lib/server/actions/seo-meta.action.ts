"use server";
// Server actions for the Article to SEO Meta tool — generate and regenerate SEO title/description variations.

import {
	SEO_META_DAILY_SHARED_POOL,
	SEO_META_DAILY_USER_CAP,
} from "@/lib/constants";
import type {
	ArticleSource,
	SeoMetaResult,
	SeoMetaVariation,
	TokenUsage,
} from "@/lib/types";
import { generateSeoMetaVariations } from "@/lib/server/services";
import {
	articleSourceErrorRules,
	enforceDailyQuota,
	type QuotaConfig,
	getHostedQuotaStatus,
	resolveArticleSource,
	toUserMessage,
	withResolvedArticleUrl,
} from "@/lib/server/utils/ai";

/** Hosted-tier rate limits for this tool — per-user daily cap + the shared daily pool. */
const SEO_META_QUOTA_CONFIG: QuotaConfig = {
	toolSlug: "article-to-seo-meta",
	perUserDaily: SEO_META_DAILY_USER_CAP,
	dailyPool: SEO_META_DAILY_SHARED_POOL,
};

/** The per-request instruction lines appended to the agent's system prompt: how many variations to write, and the optional target keyword. */
function buildSeoMetaInstructions(
	keyword: string | undefined,
	count: number,
): string {
	const lines: string[] = [`variationCount: ${count}`];
	if (keyword) lines.push(`primaryKeyword: ${keyword}`);
	return lines.join("\n");
}

/** Instructions for regenerating ONE variation — lists the existing variations so the model returns a clearly different angle, not a near-duplicate. */
function buildSeoMetaRegenerateInstructions(
	keyword: string | undefined,
	existing: SeoMetaVariation[],
): string {
	const lines: string[] = ["variationCount: 1"];
	if (keyword) lines.push(`primaryKeyword: ${keyword}`);
	if (existing.length > 0) {
		lines.push(
			"",
			"REGENERATE: Produce ONE new variation with a clearly different angle and wording from the ones below — do not repeat their phrasing:",
			...existing.map(
				(v, i) =>
					`${i + 1}. Title: "${v.title}" — Description: "${v.description}"`,
			),
		);
	}
	return lines.join("\n");
}

/** Turn a thrown error into a user-facing message using this tool's error rules (unreadable URL, empty/too-long article, quota exhausted, …). */
function toSeoMetaErrorMessage(error: unknown, byok: boolean): string {
	return toUserMessage(error, {
		logTag: "article-to-seo-meta",
		perUserDaily: SEO_META_DAILY_USER_CAP,
		byok,
		rules: articleSourceErrorRules(),
		fallback:
			"Something went wrong creating your SEO details. Please try again.",
	});
}

/** Outcome of {@link generateSeoMeta} — success carries the variations, token usage, and remaining hosted quota; failure carries a user-facing error message. */
export type GenerateSeoMetaResult =
	| {
			ok: true;
			result: SeoMetaResult;
			usage: TokenUsage;
			remaining: number | null;
	  }
	| { ok: false; error: string };

/** Outcome of {@link regenerateSeoMetaVariation} — success carries the single fresh variation, token usage, and remaining quota; failure carries a user-facing error message. */
export type RegenerateSeoMetaVariationResult =
	| {
			ok: true;
			variation: SeoMetaVariation;
			usage: TokenUsage;
			remaining: number | null;
	  }
	| { ok: false; error: string };

/** Server action — generate 1-3 SEO title/description variations for an article (URL or pasted text). */
export async function generateSeoMeta(params: {
	source: ArticleSource;
	primaryKeyword?: string;
	variationCount?: number;
	byokApiKey?: string;
	byokModel?: string;
}): Promise<GenerateSeoMetaResult> {
	try {
		const { url, text } = resolveArticleSource(params.source);

		const remaining = await enforceDailyQuota(
			SEO_META_QUOTA_CONFIG,
			params.byokApiKey,
		);

		const count = Math.min(3, Math.max(1, params.variationCount ?? 3));
		const keyword = params.primaryKeyword?.trim() || undefined;

		const { object, usage } = await generateSeoMetaVariations({
			instructions: buildSeoMetaInstructions(keyword, count),
			url,
			text,
			byokApiKey: params.byokApiKey,
			byokModel: params.byokModel,
		});
		const result: SeoMetaResult = {
			...object,
			article: withResolvedArticleUrl(object.article, url),
		};
		return { ok: true, result, usage, remaining };
	} catch (error) {
		return {
			ok: false,
			error: toSeoMetaErrorMessage(error, Boolean(params.byokApiKey)),
		};
	}
}

/** Server action — regenerate ONE SEO variation; the existing variations are passed in so the model returns a fresh angle rather than a near-duplicate. */
export async function regenerateSeoMetaVariation(params: {
	source: ArticleSource;
	primaryKeyword?: string;
	existing: SeoMetaVariation[];
	byokApiKey?: string;
	byokModel?: string;
}): Promise<RegenerateSeoMetaVariationResult> {
	try {
		const { url, text } = resolveArticleSource(params.source);

		const remaining = await enforceDailyQuota(
			SEO_META_QUOTA_CONFIG,
			params.byokApiKey,
		);

		const keyword = params.primaryKeyword?.trim() || undefined;
		const { object, usage } = await generateSeoMetaVariations({
			instructions: buildSeoMetaRegenerateInstructions(
				keyword,
				params.existing,
			),
			url,
			text,
			byokApiKey: params.byokApiKey,
			byokModel: params.byokModel,
		});
		const variation = object.variations[0];
		if (!variation) throw new Error("EMPTY_RESULT");
		return { ok: true, variation, usage, remaining };
	} catch (error) {
		return {
			ok: false,
			error: toSeoMetaErrorMessage(error, Boolean(params.byokApiKey)),
		};
	}
}

/** Server action — remaining-hosted-quota snapshot for the navbar usage pill. */
export async function fetchSeoMetaUsage() {
	return getHostedQuotaStatus();
}
