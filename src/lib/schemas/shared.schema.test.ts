import { describe, expect, it } from "vitest";

import { MAX_ARTICLE_INPUT_CHARS } from "@/lib/constants";

import { ArticleSourceSchema, ByokInputSchema } from "./shared.schema";

describe("ArticleSourceSchema", () => {
	it("accepts a URL source", () => {
		expect(
			ArticleSourceSchema.safeParse({ kind: "url", url: "https://a.com/x" })
				.success,
		).toBe(true);
	});

	it("accepts a bounded text source", () => {
		expect(
			ArticleSourceSchema.safeParse({ kind: "text", text: "article body" })
				.success,
		).toBe(true);
	});

	// The daily quota counts requests — these bounds are what stop one allowed
	// request from carrying megabytes to Gemini on the platform key.
	it("rejects text over the input cap", () => {
		expect(
			ArticleSourceSchema.safeParse({
				kind: "text",
				text: "a".repeat(MAX_ARTICLE_INPUT_CHARS + 1),
			}).success,
		).toBe(false);
	});

	it("rejects a URL over 2048 chars", () => {
		expect(
			ArticleSourceSchema.safeParse({
				kind: "url",
				url: `https://a.com/${"x".repeat(2048)}`,
			}).success,
		).toBe(false);
	});

	it("rejects empty text and unknown kinds", () => {
		expect(
			ArticleSourceSchema.safeParse({ kind: "text", text: "" }).success,
		).toBe(false);
		expect(
			ArticleSourceSchema.safeParse({ kind: "file", path: "/etc" }).success,
		).toBe(false);
	});
});

describe("ByokInputSchema", () => {
	it("accepts a plausible Google key and an allowlisted model", () => {
		expect(
			ByokInputSchema.safeParse({
				byokApiKey: "AIzaSyFakeUserKey1234567890123456789",
				byokModel: "gemini-flash-latest",
			}).success,
		).toBe(true);
	});

	it("accepts both fields absent (hosted path)", () => {
		expect(ByokInputSchema.safeParse({}).success).toBe(true);
	});

	it.each([
		["too short", "shortkey"],
		["too long", "A".repeat(201)],
		["spaced out", "AIza key with spaces and $(injection)"],
		["newline-carrying", "AIzaSyFakeUserKey123456789012\nX-Injected: 1"],
	])("rejects a key that is %s", (_label, byokApiKey) => {
		expect(ByokInputSchema.safeParse({ byokApiKey }).success).toBe(false);
	});

	// The provider owns the key format, so unusual-but-whitespace-free characters
	// must pass — an allowlist here would reject valid keys after a format change.
	it.each([
		["dots", "AIzaSy.Fake.User.Key.1234567890123"],
		["equals padding", "AIzaSyFakeUserKey12345678901234=="],
		["tildes and plus", "AIzaSy~Fake+User+Key+123456789012"],
	])("accepts a key with %s", (_label, byokApiKey) => {
		expect(ByokInputSchema.safeParse({ byokApiKey }).success).toBe(true);
	});

	// Only allowlisted models are honored — an arbitrary model id could point
	// the platform key at an expensive or unreleased model.
	it("rejects a model outside the BYOK allowlist", () => {
		expect(
			ByokInputSchema.safeParse({ byokModel: "gemini-2.5-ultra-max" }).success,
		).toBe(false);
	});
});
