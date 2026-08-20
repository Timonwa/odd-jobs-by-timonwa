// Clipboard-copy builders for generated posts — a single post and all posts combined.

import { SOCIAL_POST_PLATFORM_LABELS } from "@/lib/constants";
import type { SocialPost } from "@/lib/types";

const appendUrl = (body: string, articleUrl?: string): string => {
	const u = articleUrl?.trim();
	if (!u) return body;
	// Agent sometimes emits the URL itself; skip appending to avoid a duplicate.
	// Exact-match is enough — shortened URLs are rare in generated content.
	if (body.includes(u)) return body;
	return `${body}\n\n${u}`;
};

/** Builds the clipboard string for a single post — formats threads as numbered posts and appends the article URL. */
export const buildPostCopyText = (
	post: SocialPost,
	articleUrl?: string,
): string => {
	if (post.thread && post.thread.length > 1) {
		const len = post.thread.length;
		const body = post.thread
			.map((p, i) => `${i + 1}/${len}\n${p}`)
			.join("\n\n");
		return appendUrl(body, articleUrl);
	}
	return appendUrl(post.content, articleUrl);
};

/** Builds a combined clipboard string for all posts, separated by Markdown dividers. */
export const buildAllPostsCopyText = (
	posts: SocialPost[],
	articleUrl?: string,
): string =>
	posts
		.map(
			(post) =>
				`### ${SOCIAL_POST_PLATFORM_LABELS[post.platform]}\n\n${buildPostCopyText(post, articleUrl)}\n`,
		)
		.join("\n---\n\n");
