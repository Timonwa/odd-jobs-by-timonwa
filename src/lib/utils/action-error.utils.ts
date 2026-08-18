// Client-side handling for a Server Action call that threw rather than
// returning a result.
//
// These catch blocks previously reported every failure as a connectivity
// problem and logged nothing — so a payload-size rejection, a serialization
// failure, or a plain bug in the code after the `await` all told the user to
// check their internet, and left nothing to debug from.

const OFFLINE_MESSAGE =
	"We couldn't reach the server. Check your internet connection and try again.";

const PAYLOAD_MESSAGE =
	"That article is too large to send. Shorten it a little and try again.";

const GENERIC_MESSAGE =
	"Something went wrong on our end. Please try again in a moment.";

/** Turn a thrown Server Action call into a user-facing message, logging the real error so it stays debuggable. `tag` names the call site in the console. */
export function toActionCallErrorMessage(error: unknown, tag: string): string {
	console.error(`[${tag}]`, error);

	// The browser is genuinely offline — the only case where blaming the
	// connection is accurate.
	if (typeof navigator !== "undefined" && navigator.onLine === false)
		return OFFLINE_MESSAGE;

	const message = error instanceof Error ? error.message : String(error);

	// Next rejects Server Action bodies over its size limit; these payloads carry
	// a whole article plus history, so it's a reachable case with a real fix.
	if (/body exceeded|payload too large|413/i.test(message))
		return PAYLOAD_MESSAGE;

	// A genuine network failure surfaces as a TypeError from fetch.
	if (error instanceof TypeError && /fetch|network/i.test(message))
		return OFFLINE_MESSAGE;

	return GENERIC_MESSAGE;
}
