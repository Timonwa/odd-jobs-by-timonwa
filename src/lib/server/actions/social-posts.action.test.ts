import { beforeEach, describe, expect, it, vi } from "vitest";

import { SOCIAL_POST_DEFAULT_STYLE } from "@/lib/constants";

const generateSocialPostDrafts = vi.fn();
vi.mock("@/lib/server/services", () => ({
	generateSocialPostDrafts: (opts: unknown) => generateSocialPostDrafts(opts),
}));

const enforceDailyQuota = vi.fn();
vi.mock("@/lib/server/utils/ai", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@/lib/server/utils/ai")>();
	return {
		...actual,
		enforceDailyQuota: (config: unknown, byokKey?: string) =>
			enforceDailyQuota(config, byokKey),
	};
});

import {
	generateSocialPosts,
	regenerateSocialPost,
} from "./social-posts.action";

const BYOK_KEY = "AIzaSyFakeUserKey1234567890123456789";

const AI_RESULT = {
	object: {
		article: { title: "Post" },
		posts: [
			{ platform: "x", content: "An X post.", hashtags: ["dev"] },
			{ platform: "linkedin", content: "A LinkedIn post.", hashtags: [] },
		],
	},
	usage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 },
};

const VALID_PARAMS = {
	source: { kind: "text", text: "A full article body." },
	platforms: ["x", "linkedin"],
	xThreadLength: 1,
	style: SOCIAL_POST_DEFAULT_STYLE,
} satisfies Parameters<typeof generateSocialPosts>[0];

beforeEach(() => {
	vi.spyOn(console, "error").mockImplementation(() => {});
	generateSocialPostDrafts.mockReset().mockResolvedValue(AI_RESULT);
	enforceDailyQuota.mockReset().mockResolvedValue(5);
});

describe("generateSocialPosts", () => {
	it("validates input before charging quota or calling the model", async () => {
		const result = await generateSocialPosts({
			...VALID_PARAMS,
			platforms: ["myspace"] as never,
		});
		expect(result.ok).toBe(false);
		expect(enforceDailyQuota).not.toHaveBeenCalled();
		expect(generateSocialPostDrafts).not.toHaveBeenCalled();
	});

	it("builds one post per platform with its char limit", async () => {
		const result = await generateSocialPosts(VALID_PARAMS);
		expect(result).toMatchObject({ ok: true, remaining: 5 });
		if (result.ok) {
			expect(result.data.posts).toHaveLength(2);
			for (const post of result.data.posts) {
				expect(post.charLimit).toBeGreaterThan(0);
				expect(post.charCount).toBe(post.content.length);
			}
		}
	});

	it("skips metering for BYOK and never leaks the key on failure", async () => {
		enforceDailyQuota.mockResolvedValue(null);
		generateSocialPostDrafts.mockRejectedValue(
			new Error(`403 forbidden ${BYOK_KEY}`),
		);
		const result = await generateSocialPosts({
			...VALID_PARAMS,
			byokApiKey: BYOK_KEY,
		});
		expect(enforceDailyQuota).toHaveBeenCalledWith(expect.anything(), BYOK_KEY);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).not.toContain(BYOK_KEY);
	});
});

describe("regenerateSocialPost", () => {
	const REGEN_PARAMS = {
		source: VALID_PARAMS.source,
		platform: "x",
		xThreadLength: 1,
		style: SOCIAL_POST_DEFAULT_STYLE,
	} as const;

	it("returns the regenerated post for the requested platform", async () => {
		const result = await regenerateSocialPost(REGEN_PARAMS);
		expect(result).toMatchObject({
			ok: true,
			post: { platform: "x", content: "An X post." },
		});
	});

	it("maps a missing platform post to its coded copy", async () => {
		generateSocialPostDrafts.mockResolvedValue({
			...AI_RESULT,
			object: { article: {}, posts: [] },
		});
		const result = await regenerateSocialPost(REGEN_PARAMS);
		expect(result).toEqual({
			ok: false,
			error: expect.stringContaining("didn't create a post"),
		});
	});
});
