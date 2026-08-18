import { beforeEach, describe, expect, it, vi } from "vitest";

const generateSeoMetaVariations = vi.fn();
vi.mock("@/lib/server/services", () => ({
	generateSeoMetaVariations: (opts: unknown) => generateSeoMetaVariations(opts),
}));

// Real validation, source resolution, and error mapping; mocked quota so tests
// control the metering outcome without Redis.
const enforceDailyQuota = vi.fn();
vi.mock("@/lib/server/utils/ai", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/server/utils/ai")>();
	return {
		...actual,
		enforceDailyQuota: (config: unknown, byokKey?: string) =>
			enforceDailyQuota(config, byokKey),
	};
});

import { generateSeoMeta, regenerateSeoMetaVariation } from "./seo-meta.action";

const BYOK_KEY = "AIzaSyFakeUserKey1234567890123456789";

const AI_RESULT = {
	object: {
		article: { title: "Post" },
		variations: [{ title: "T1", description: "D1" }],
	},
	usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 },
};

const VALID_PARAMS = {
	source: { kind: "text", text: "A full article body." },
} as const;

beforeEach(() => {
	vi.spyOn(console, "error").mockImplementation(() => {});
	generateSeoMetaVariations.mockReset().mockResolvedValue(AI_RESULT);
	enforceDailyQuota.mockReset().mockResolvedValue(7);
});

describe("generateSeoMeta", () => {
	it("validates input before charging quota or calling the model", async () => {
		const result = await generateSeoMeta({
			...VALID_PARAMS,
			byokModel: "not-an-allowlisted-model",
		});
		expect(result.ok).toBe(false);
		expect(enforceDailyQuota).not.toHaveBeenCalled();
		expect(generateSeoMetaVariations).not.toHaveBeenCalled();
	});

	it("refuses an SSRF-targeted URL before charging quota", async () => {
		const result = await generateSeoMeta({
			source: { kind: "url", url: "http://169.254.169.254/latest/meta-data/" },
		});
		expect(result).toEqual({
			ok: false,
			error: expect.stringContaining("couldn't read that link"),
		});
		expect(enforceDailyQuota).not.toHaveBeenCalled();
		expect(generateSeoMetaVariations).not.toHaveBeenCalled();
	});

	it("returns the quota refusal without calling the model", async () => {
		enforceDailyQuota.mockRejectedValue(new Error("RATE_LIMIT_USER"));
		const result = await generateSeoMeta(VALID_PARAMS);
		expect(result).toEqual({
			ok: false,
			error: expect.stringContaining("free generations for today"),
		});
		expect(generateSeoMetaVariations).not.toHaveBeenCalled();
	});

	it("succeeds on the hosted path with the remaining allowance", async () => {
		const result = await generateSeoMeta(VALID_PARAMS);
		expect(result).toMatchObject({ ok: true, remaining: 7 });
		expect(enforceDailyQuota).toHaveBeenCalledWith(
			expect.objectContaining({ toolSlug: "article-to-seo-meta" }),
			undefined,
		);
	});

	it("passes the BYOK key to the quota check so metering is skipped", async () => {
		enforceDailyQuota.mockResolvedValue(null);
		const result = await generateSeoMeta({
			...VALID_PARAMS,
			byokApiKey: BYOK_KEY,
			byokModel: "gemini-flash-latest",
		});
		expect(result).toMatchObject({ ok: true, remaining: null });
		expect(enforceDailyQuota).toHaveBeenCalledWith(expect.anything(), BYOK_KEY);
		expect(generateSeoMetaVariations).toHaveBeenCalledWith(
			expect.objectContaining({
				byokApiKey: BYOK_KEY,
				byokModel: "gemini-flash-latest",
			}),
		);
	});

	// The BYOK promise: a provider error that embeds the user's key must never
	// surface in the action's returned error message.
	it("never leaks the BYOK key through an error message", async () => {
		generateSeoMetaVariations.mockRejectedValue(
			new Error(`401 invalid key ${BYOK_KEY}`),
		);
		const result = await generateSeoMeta({
			...VALID_PARAMS,
			byokApiKey: BYOK_KEY,
		});
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).not.toContain(BYOK_KEY);
	});

	it("resolves the article URL into the result's article meta", async () => {
		const url = "https://example.com/post";
		const result = await generateSeoMeta({ source: { kind: "url", url } });
		expect(result).toMatchObject({
			ok: true,
			result: { article: { title: "Post", url } },
		});
	});
});

describe("regenerateSeoMetaVariation", () => {
	const REGEN_PARAMS = {
		...VALID_PARAMS,
		existing: [{ title: "Old", description: "Old desc" }],
	};

	it("returns the single fresh variation", async () => {
		const result = await regenerateSeoMetaVariation(REGEN_PARAMS);
		expect(result).toMatchObject({
			ok: true,
			variation: { title: "T1", description: "D1" },
		});
	});

	it("rejects an unbounded `existing` list at the schema", async () => {
		const result = await regenerateSeoMetaVariation({
			...VALID_PARAMS,
			existing: Array.from({ length: 4 }, () => ({
				title: "t",
				description: "d",
			})),
		});
		expect(result.ok).toBe(false);
		expect(generateSeoMetaVariations).not.toHaveBeenCalled();
	});

	it("maps an empty model reply to the fallback copy", async () => {
		generateSeoMetaVariations.mockResolvedValue({
			...AI_RESULT,
			object: { article: {}, variations: [] },
		});
		const result = await regenerateSeoMetaVariation(REGEN_PARAMS);
		expect(result).toEqual({
			ok: false,
			error: expect.stringContaining("Something went wrong"),
		});
	});
});
