// Schema-validated generation from an article — URL via url_context or inline text, with retries.

import { generateText, isStepCount, Output, type ToolSet } from "ai";
import type { z } from "zod";

import { createGeminiClient, toTokenUsage } from "../../clients/gemini.client";
import type { TokenUsage } from "@/lib/types";

type GeminiProvider = ReturnType<typeof createGeminiClient>["provider"];

function prepareArticleSource(opts: {
	provider: GeminiProvider;
	url?: string;
	text?: string;
}): {
	usingUrl: boolean;
	sourceBlock: string;
	tools?: ToolSet;
	stopWhen?: ReturnType<typeof isStepCount>;
} {
	if (opts.url) {
		return {
			usingUrl: true,
			sourceBlock: `Read the article at this URL with the url_context tool and base your output strictly on its real content:\n${opts.url}`,
			// The Google provider's tool type lags the core `ToolSet` type in this
			// version, so cast the provider-executed url_context tool.
			tools: { url_context: opts.provider.tools.urlContext({}) } as ToolSet,
			// URL retrieval + the structured-output step both fit well under 3 steps
			// (Gemini runs the fetch server-side, so it is usually a single step).
			stopWhen: isStepCount(3),
		};
	}
	return {
		usingUrl: false,
		sourceBlock: `ARTICLE TEXT:\n"""\n${opts.text ?? ""}\n"""`,
	};
}

type UrlMeta = { retrievedUrl?: string; urlRetrievalStatus?: string };

function getUrlRetrievalStatus(
	steps: readonly { providerMetadata?: unknown }[],
	url: string,
): string | undefined {
	const normalizeUrl = (u?: string) => (u ?? "").replace(/\/+$/, "");
	for (const step of steps) {
		const items = (
			step.providerMetadata as {
				google?: { urlContextMetadata?: { urlMetadata?: UrlMeta[] } };
			}
		)?.google?.urlContextMetadata?.urlMetadata;
		const entry = items?.find(
			(i) => normalizeUrl(i.retrievedUrl) === normalizeUrl(url),
		);
		if (entry) return entry.urlRetrievalStatus;
	}
	return undefined;
}

/** Schema-validated generation from an article — URL mode reads via `url_context`; text mode sends inline; transient failures are retried automatically. */
export async function generateSchemaOutputFromArticle<T>(opts: {
	schema: z.ZodType<T>;
	schemaName: string;
	schemaDescription: string;
	system: string;
	instructions: string;
	url?: string;
	text?: string;
	serverKey: string | undefined;
	byokApiKey?: string;
	byokModel?: string;
	temperature?: number;
	maxOutputTokens: number;
	timeoutMs?: number;
}): Promise<{ object: T; usage: TokenUsage }> {
	const { provider, model } = createGeminiClient({
		serverKey: opts.serverKey,
		byokApiKey: opts.byokApiKey,
		byokModel: opts.byokModel,
	});

	const { usingUrl, sourceBlock, tools, stopWhen } = prepareArticleSource({
		provider,
		url: opts.url,
		text: opts.text,
	});

	const result = await generateText({
		model,
		system: opts.system,
		prompt: `${opts.instructions}\n\n${sourceBlock}`,
		output: Output.object({
			schema: opts.schema,
			name: opts.schemaName,
			description: opts.schemaDescription,
		}),
		tools,
		stopWhen,
		temperature: opts.temperature ?? 0.7,
		maxOutputTokens: opts.maxOutputTokens,
		maxRetries: 2,
		abortSignal: AbortSignal.timeout(
			opts.timeoutMs ?? (usingUrl ? 90_000 : 60_000),
		),
	});

	if (usingUrl && opts.url) {
		// Only hard-fail when Gemini explicitly reports our URL couldn't be read;
		// missing metadata is left to trust the output.
		const status = getUrlRetrievalStatus(result.steps, opts.url);
		if (status && status !== "URL_RETRIEVAL_STATUS_SUCCESS") {
			throw new Error("URL_UNREADABLE: Gemini could not read the article URL");
		}
	}
	if (!result.output) throw new Error("EMPTY_OUTPUT: the AI returned nothing");
	return { object: result.output, usage: toTokenUsage(result.usage) };
}

/** Restore the source URL on the agent's article metadata — the model leaves `article.url` blank, so tools stamp back the URL they actually fetched (empty string for pasted-text runs). */
export function withResolvedArticleUrl<T extends { url?: string }>(
	article: T,
	url: string | undefined,
): T {
	return { ...article, url: url ?? "" };
}
