"use client";

// Clipboard write plus the transient "Copied" state that follows it — the same
// four lines were repeated in CopyButton, ShareBar, and both AI tools' hooks.
//
// Keyed rather than boolean so a list can show feedback on the one row that was
// copied; callers with a single button ignore the key.

import { useState } from "react";

import { COPY_FEEDBACK_MS } from "@/lib/constants";

const SINGLE = "single";

export function useCopyFeedback() {
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	/**
	 * Writes `text` and flags `key` as copied for {@link COPY_FEEDBACK_MS}.
	 *
	 * Returns whether the write succeeded rather than handling failure itself:
	 * the clipboard is blocked in insecure contexts and without user activation,
	 * and each caller words that differently. Awaited so a blocked write never
	 * leaves the UI claiming "Copied" with nothing on the clipboard.
	 */
	async function copy(text: string, key: string = SINGLE): Promise<boolean> {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedKey(key);
			// Only clear if this key is still the current one — a second copy
			// elsewhere shouldn't have its feedback cut short by the first timer.
			setTimeout(
				() => setCopiedKey((cur) => (cur === key ? null : cur)),
				COPY_FEEDBACK_MS,
			);
			return true;
		} catch {
			return false;
		}
	}

	return {
		copiedKey,
		/** True when the given key (or the single unkeyed target) was just copied. */
		isCopied: (key: string = SINGLE) => copiedKey === key,
		copy,
	};
}
