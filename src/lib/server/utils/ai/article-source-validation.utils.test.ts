import { describe, expect, it } from "vitest";

import { MAX_ARTICLE_INPUT_CHARS } from "@/lib/constants";

import {
	articleSourceErrorRules,
	assertSafeArticleUrl,
	resolveArticleSource,
} from "./article-source-validation.utils";

describe("assertSafeArticleUrl", () => {
	it("returns the trimmed URL for a public https target", () => {
		expect(assertSafeArticleUrl("  https://example.com/post ")).toBe(
			"https://example.com/post",
		);
	});

	it("allows public http targets", () => {
		expect(assertSafeArticleUrl("http://example.com")).toBe(
			"http://example.com",
		);
	});

	it.each(["", "   ", undefined])(
		"throws URL_EMPTY for blank input (%j)",
		(input) => {
			expect(() => assertSafeArticleUrl(input)).toThrow("URL_EMPTY");
		},
	);

	it("throws URL_UNREADABLE for an unparseable URL", () => {
		expect(() => assertSafeArticleUrl("not a url")).toThrow("URL_UNREADABLE");
	});

	it.each([
		"file:///etc/passwd",
		"ftp://example.com/file",
		"javascript:alert(1)",
		"gopher://example.com",
		"data:text/html,hi",
	])("rejects non-http(s) scheme: %s", (url) => {
		expect(() => assertSafeArticleUrl(url)).toThrow("URL_UNREADABLE");
	});

	// SSRF vectors — each must be refused before it is ever handed to Gemini.
	it.each([
		// loopback
		"http://localhost/admin",
		"http://sub.localhost/",
		"http://127.0.0.1/",
		"http://127.8.9.10/",
		"http://0.0.0.0/",
		"http://[::1]/",
		"http://[::]/",
		"http://[0:0:0:0:0:0:0:1]/",
		// cloud metadata + link-local
		"http://169.254.169.254/latest/meta-data/",
		"http://169.254.0.1/",
		// RFC 1918
		"http://10.0.0.5/",
		"http://192.168.1.1/",
		"http://172.16.0.1/",
		"http://172.31.255.255/",
		// carrier-grade NAT and benchmarking
		"http://100.64.0.1/",
		"http://100.127.255.255/",
		"http://198.18.0.1/",
		"http://198.19.0.1/",
		// IPv6 local ranges
		"http://[fe80::1]/",
		"http://[fc00::1]/",
		"http://[fd12:3456::1]/",
		// IPv4-mapped IPv6, hex and dotted forms
		"http://[::ffff:7f00:1]/",
		"http://[::ffff:127.0.0.1]/",
		"http://[::ffff:10.0.0.1]/",
		// zero-net IPv4
		"http://0.1.2.3/",
	])("blocks internal host: %s", (url) => {
		expect(() => assertSafeArticleUrl(url)).toThrow(
			"URL_UNREADABLE: that host is not allowed",
		);
	});

	it.each([
		"http://172.15.0.1/", // just below the 172.16–31 private range
		"http://172.32.0.1/", // just above it
		"http://100.63.0.1/", // below CGNAT
		"http://100.128.0.1/", // above CGNAT
		"http://8.8.8.8/",
		"http://169.253.1.1/",
	])("allows public IP just outside a blocked range: %s", (url) => {
		expect(assertSafeArticleUrl(url)).toBe(url);
	});
});

describe("resolveArticleSource", () => {
	it("resolves a safe URL source", () => {
		expect(
			resolveArticleSource({ kind: "url", url: "https://example.com/a" }),
		).toEqual({ url: "https://example.com/a" });
	});

	it("propagates the SSRF guard for URL sources", () => {
		expect(() =>
			resolveArticleSource({ kind: "url", url: "http://10.0.0.1/" }),
		).toThrow("URL_UNREADABLE");
	});

	it("returns trimmed pasted text", () => {
		expect(resolveArticleSource({ kind: "text", text: "  hello  " })).toEqual({
			text: "hello",
		});
	});

	it("throws ARTICLE_EMPTY for blank text", () => {
		expect(() => resolveArticleSource({ kind: "text", text: "   " })).toThrow(
			"ARTICLE_EMPTY",
		);
	});

	it("throws ARTICLE_TOO_LONG past the input cap", () => {
		const text = "a".repeat(MAX_ARTICLE_INPUT_CHARS + 1);
		expect(() => resolveArticleSource({ kind: "text", text })).toThrow(
			"ARTICLE_TOO_LONG",
		);
	});

	it("accepts text exactly at the input cap", () => {
		const text = "a".repeat(MAX_ARTICLE_INPUT_CHARS);
		expect(resolveArticleSource({ kind: "text", text })).toEqual({ text });
	});
});

describe("articleSourceErrorRules", () => {
	it("maps every coded error to user-facing copy", () => {
		const rules = articleSourceErrorRules();
		for (const code of [
			"URL_EMPTY",
			"URL_UNREADABLE",
			"ARTICLE_EMPTY",
			"ARTICLE_TOO_LONG",
		]) {
			expect(rules.some(([pattern]) => pattern.test(code))).toBe(true);
		}
	});

	it("appends the length hint to the too-long message", () => {
		const rules = articleSourceErrorRules("(about 2,500 words)");
		const tooLong = rules.find(([pattern]) => pattern.test("ARTICLE_TOO_LONG"));
		expect(tooLong?.[1]).toContain("(about 2,500 words)");
	});
});
