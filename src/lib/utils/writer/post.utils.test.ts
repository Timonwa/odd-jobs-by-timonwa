import { describe, expect, it } from "vitest";

import type { SocialPost } from "@/lib/types";

import { buildAllPostsCopyText, buildPostCopyText } from "./post.utils";

const post = (overrides: Partial<SocialPost>): SocialPost => ({
	platform: "x",
	content: "Check out my new article.",
	hashtags: [],
	charCount: 25,
	charLimit: 280,
	...overrides,
});

describe("buildPostCopyText", () => {
	it("returns the content for a single post", () => {
		expect(buildPostCopyText(post({}))).toBe("Check out my new article.");
	});

	it("appends the article URL on a blank line", () => {
		expect(buildPostCopyText(post({}), "https://a.com/post")).toBe(
			"Check out my new article.\n\nhttps://a.com/post",
		);
	});

	it("skips appending when the content already contains the URL", () => {
		const p = post({ content: "Read https://a.com/post now" });
		expect(buildPostCopyText(p, "https://a.com/post")).toBe(
			"Read https://a.com/post now",
		);
	});

	it("numbers thread parts", () => {
		const p = post({ thread: ["First part", "Second part"] });
		expect(buildPostCopyText(p)).toBe("1/2\nFirst part\n\n2/2\nSecond part");
	});

	it("treats a single-item thread as a plain post", () => {
		const p = post({ thread: ["Only part"] });
		expect(buildPostCopyText(p)).toBe(p.content);
	});
});

describe("buildAllPostsCopyText", () => {
	it("labels each platform and separates posts with dividers", () => {
		const text = buildAllPostsCopyText([
			post({ platform: "x" }),
			post({ platform: "linkedin", content: "LinkedIn version." }),
		]);
		expect(text).toContain("### X (Twitter)");
		expect(text).toContain("### LinkedIn");
		expect(text).toContain("\n---\n");
	});
});
