// Validates and resolves a tool's article source before generation — SSRF-safe URL check, empty/too-long guards with coded errors, and the tool-agnostic error copy for those codes.

import { MAX_ARTICLE_INPUT_CHARS } from "@/lib/constants";
import type { ArticleSourceType } from "@/lib/types";

// Hostnames/IP literals that must never be fetched: loopback, link-local
// (incl. the cloud metadata endpoint 169.254.169.254), and RFC 1918 ranges.
function isBlockedHost(hostname: string): boolean {
	const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
	if (host === "localhost" || host.endsWith(".localhost")) return true;
	if (host === "0.0.0.0" || host === "::1" || host === "::") return true;
	// IPv6 loopback/link-local/unique-local.
	if (
		host.startsWith("fe80:") ||
		host.startsWith("fc") ||
		host.startsWith("fd")
	)
		return true;
	// IPv4 literals (also handles ::ffff: mapped form).
	const v4 = host.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (v4) {
		const [a, b] = [Number(v4[1]), Number(v4[2])];
		if (a === 127 || a === 10 || a === 0) return true;
		if (a === 169 && b === 254) return true; // link-local + metadata
		if (a === 192 && b === 168) return true;
		if (a === 172 && b >= 16 && b <= 31) return true;
	}
	return false;
}

/** Validate a user-supplied article URL — allows only public http(s) targets; throws the coded `URL_EMPTY`/`URL_UNREADABLE` errors the tools map to friendly messages. */
export function assertSafeArticleUrl(raw: string | undefined): string {
	const url = raw?.trim();
	if (!url) throw new Error("URL_EMPTY");
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error("URL_UNREADABLE: not a valid URL");
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
		throw new Error("URL_UNREADABLE: only http and https URLs are supported");
	}
	if (isBlockedHost(parsed.hostname)) {
		throw new Error("URL_UNREADABLE: that host is not allowed");
	}
	return url;
}

/** Validate an article source shared by every AI tool and return what the agent should read — a safe URL, or trimmed pasted text. Throws the coded, tool-agnostic errors ARTICLE_EMPTY / ARTICLE_TOO_LONG (or a URL_* error) that each tool maps to its own copy. */
export function resolveArticleSource(source: ArticleSourceType): {
	url?: string;
	text?: string;
} {
	if (source.kind === "url") {
		return { url: assertSafeArticleUrl(source.url) };
	}
	const text = source.text?.trim();
	if (!text) throw new Error("ARTICLE_EMPTY");
	if (text.length > MAX_ARTICLE_INPUT_CHARS)
		throw new Error("ARTICLE_TOO_LONG");
	return { text };
}

/** The message half of the article-input contract — maps the coded errors {@link resolveArticleSource} throws (URL_*, ARTICLE_*) to shared, tool-agnostic copy. Each tool spreads these into its own error rules and appends any tool-specific ones. `lengthHint` lets a tool add a parenthetical like "(about 2,500 words)" to the too-long message. */
export function articleSourceErrorRules(
	lengthHint?: string,
): [RegExp, string][] {
	return [
		[/URL_EMPTY/, "Paste a link before generating."],
		[
			/URL_UNREADABLE/,
			"We couldn't read that link. Double-check the web address, or paste the article text in directly instead.",
		],
		[/ARTICLE_EMPTY/, "Paste your article before generating."],
		[
			/ARTICLE_TOO_LONG/,
			`Your article is too long. Keep it under ${MAX_ARTICLE_INPUT_CHARS.toLocaleString()} characters${lengthHint ? ` ${lengthHint}` : ""}, then try again.`,
		],
	];
}
