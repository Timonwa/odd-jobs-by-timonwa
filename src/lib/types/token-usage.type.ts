/** Provider-agnostic LLM token usage — the AI layer normalizes each provider's response into this shape; tools surface it in their results. */
export type TokenUsageType = {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
};
