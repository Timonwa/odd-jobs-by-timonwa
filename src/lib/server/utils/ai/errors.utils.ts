// Maps AI SDK and tool errors to plain-English, user-facing messages.

import { APICallError, NoObjectGeneratedError } from "ai";

/** Options for `toUserMessage` — log tag, quota shape, BYOK flag, and tool-specific error rules. */
export type ToolErrorOptions = {
	logTag: string;
	perUserDaily: number;
	byok?: boolean;
	rules?: [RegExp, string][];
	fallback: string;
};

// Anything key-shaped, whether it arrived as a query param or bare in a URL or
// message. Logging a provider error verbatim can retain a credential — and on
// the BYOK path that would be the *user's* key, which this app promises never
// leaves their browser session.
const KEY_PATTERN =
	/\b(AIza[0-9A-Za-z_-]{10,})\b|([?&](?:key|api_?key)=)[^&\s"']+/gi;

function redact(value: string): string {
	return value.replace(KEY_PATTERN, (_match, _bare, prefix) =>
		prefix ? `${prefix}[redacted]` : "[redacted]",
	);
}

/** A loggable projection of an error — the fields worth debugging, with credentials stripped. Logging the raw object risks retaining an API key from provider metadata. */
function toLoggable(error: unknown): Record<string, unknown> {
	if (!(error instanceof Error)) return { value: redact(String(error)) };
	const withProviderFields = error as Error & {
		statusCode?: number;
		url?: string;
		responseBody?: string;
		finishReason?: string;
	};
	return {
		name: error.name,
		message: redact(error.message),
		...(withProviderFields.statusCode !== undefined && {
			statusCode: withProviderFields.statusCode,
		}),
		...(withProviderFields.url && { url: redact(withProviderFields.url) }),
		...(withProviderFields.responseBody && {
			responseBody: redact(withProviderFields.responseBody).slice(0, 500),
		}),
		...(withProviderFields.finishReason && {
			finishReason: withProviderFields.finishReason,
		}),
	};
}

/** AI SDK error → plain-English user message — reads typed SDK errors directly, adapts advice to BYOK vs hosted, checks tool-specific rules first. */
export function toUserMessage(error: unknown, opts: ToolErrorOptions): string {
	console.error(`[${opts.logTag}]`, toLoggable(error));
	const byok = opts.byok ?? false;
	const message = error instanceof Error ? error.message : String(error);

	// Tool-specific coded errors first (matched on the original message).
	for (const [pattern, msg] of opts.rules ?? []) {
		if (pattern.test(message)) return msg;
	}

	// Our own coded sentinels next, before any of Google's fuzzier error text
	// below — a raw "RATE_LIMIT_USER" also matches the generic rate-limit check,
	// so matching it here is what stops a used-up daily allowance from being
	// mis-reported as a transient "we're busy right now".

	// No Gemini key configured on the server at all — only the hosted path hits
	// this (BYOK always sends a key). Not transient, so no "try again".
	if (/NO_SERVER_KEY/.test(message))
		return "This tool isn't available to run right now. Add your own free Google key to use it — it only takes a couple of minutes.";

	// Metering isn't live, so hosted generations are refused rather than run
	// unbounded on the platform key. An operator problem, not the user's.
	if (/QUOTA_UNAVAILABLE/.test(message))
		return "The free hosted allowance isn't available right now. Add your own free Google key to use this tool — it only takes a couple of minutes.";

	// Too many requests in a short window — unlike the daily caps this clears in
	// under a minute, so the advice is to wait rather than to bring a key.
	if (/RATE_LIMIT_BURST/.test(message))
		return "That's a lot of requests in a row. Wait a minute and try again.";

	// This person's hosted daily allowance is used up — not the server being
	// busy. Only thrown on the hosted path (BYOK skips the quota entirely).
	if (/RATE_LIMIT_USER/.test(message))
		return `You've used up your ${opts.perUserDaily} free generations for today. They reset tomorrow — or add your own free Google key to keep going now.`;

	// The shared hosted allowance across everyone is used up — not this person's.
	if (/RATE_LIMIT_POOL/.test(message))
		return "The free daily limit shared across everyone is used up for today. It resets tomorrow — or add your own free Google key to keep going now.";

	// The AI SDK couldn't produce a valid object; finishReason says why.
	if (NoObjectGeneratedError.isInstance(error)) {
		if (error.finishReason === "content-filter")
			return "Google blocked this text for safety reasons. Change the wording and try again.";
		if (error.finishReason === "length")
			return "The reply got cut off before it finished. Try again, or shorten your input a little.";
		return "The AI's reply didn't come through properly. Please try again — this almost always works the second time.";
	}

	// The request was cancelled for taking too long.
	if (
		(error instanceof Error &&
			(error.name === "AbortError" || error.name === "TimeoutError")) ||
		/\baborted\b|timed?.?out/i.test(message)
	)
		return "That took too long, so we stopped it. Please try again.";

	// Fold an API call's HTTP status into the text so the checks below are
	// reliable even when the message doesn't spell the status out.
	const raw =
		APICallError.isInstance(error) && error.statusCode
			? `${error.statusCode} ${message}`
			: message;

	// Google's AI is momentarily overloaded — transient, and on their side.
	if (/\b503\b|UNAVAILABLE|overload|high demand/i.test(raw))
		return "Google's AI is busy right now. Wait a few seconds and try again.";

	// Google itself throttled the key in use (its own 429 / free-tier quota) —
	// distinct from our per-user cap above. Transient: wait a moment and retry.
	if (/RESOURCE_EXHAUSTED|rate.?limit|quota|\b429\b/i.test(raw))
		return byok
			? "Your Google key has been used too many times for now. Wait a minute and try again, or check how much it has left in Google AI Studio."
			: "We're getting a lot of requests right now. Wait a minute and try again — or add your own free Google key to skip the wait.";

	// Google rejected the key (or the request had no valid identity).
	if (
		/\b401\b|\b403\b|unauthoriz|forbidden|invalid.*api.?key|API_KEY_INVALID|PERMISSION_DENIED|unregistered callers/i.test(
			raw,
		)
	)
		return byok
			? "Google didn't accept your API key. Open “Set API key” and paste it again, or create a new free key. New to this? The 2-minute guide walks you through it."
			: "Something went wrong on our end. Please try again in a moment, or add your own free Google key to keep going.";

	// Content tripped Google's safety filter.
	if (/SAFETY|safety.?filter|blocked.*safety/i.test(raw))
		return "Google blocked this text for safety reasons. Change the wording and try again.";

	// Malformed / unreadable output that wasn't a typed NoObjectGeneratedError.
	if (
		/SCHEMA_MISMATCH/.test(raw) ||
		(error instanceof Error &&
			(error.name === "ZodError" ||
				/invalid_type|Expected .* received/i.test(raw)))
	)
		return "The AI's reply didn't come through properly. Please try again — this almost always works the second time.";

	return opts.fallback;
}
