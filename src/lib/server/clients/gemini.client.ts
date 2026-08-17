// Gemini provider/model setup and token-usage mapping for server-side AI calls.

import { createGoogle } from "@ai-sdk/google";
import { env } from "@env";

import { BYOK_MODELS, DEFAULT_BYOK_MODEL } from "@/lib/config/byok";
import type { TokenUsageType } from "@/lib/types";

const ALLOWED_BYOK_MODELS = new Set<string>(BYOK_MODELS.map((m) => m.value));

/** Gemini provider + model for a tool call — the user's BYOK key overrides the platform server key; throws `NO_SERVER_KEY` when neither is set. */
export function createGeminiClient(opts: {
	serverKey: string | undefined;
	byokApiKey?: string;
	byokModel?: string;
}) {
	const key = opts.byokApiKey || opts.serverKey;
	if (!key) {
		throw new Error(
			"NO_SERVER_KEY: no Gemini API key is configured. Set GOOGLE_API_KEY in your environment, or use your own key via “Set API key”.",
		);
	}
	// Only honor a caller-supplied model on the BYOK path, and only if it's in the
	// allowlist — never trust the client-sent string blindly.
	const resolvedByokModel =
		opts.byokModel && ALLOWED_BYOK_MODELS.has(opts.byokModel)
			? opts.byokModel
			: DEFAULT_BYOK_MODEL;
	const modelId = opts.byokApiKey ? resolvedByokModel : env.LLM_MODEL;
	const provider = createGoogle({ apiKey: key });
	return { provider, model: provider(modelId) };
}

/** AI SDK token usage mapped to the internal shape — undefined provider fields default to 0. */
export function toTokenUsage(usage: {
	inputTokens?: number;
	outputTokens?: number;
	totalTokens?: number;
}): TokenUsageType {
	return {
		promptTokens: usage.inputTokens ?? 0,
		completionTokens: usage.outputTokens ?? 0,
		totalTokens: usage.totalTokens ?? 0,
	};
}
