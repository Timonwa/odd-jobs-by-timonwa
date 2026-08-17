// Loads newsletter issue content and metadata (MDX) for the archive.

import "server-only";

import { IssueFrontmatterSchema, type IssueMetaType } from "@/lib/schemas";
import { createMdxLoader } from "../utils/create-mdx-loader";

const loader = createMdxLoader({
	dir: "issues",
	schema: IssueFrontmatterSchema,
	// Newest issue first — by issue number when both have one, else by date.
	sort: (a, b) => {
		if (a.issueNumber != null && b.issueNumber != null) {
			return b.issueNumber - a.issueNumber;
		}
		return a.publishedAt < b.publishedAt ? 1 : -1;
	},
});

/** Slugs of every issue in the content directory (filenames minus `.mdx`). */
export const getIssueSlugs = loader.getSlugs;

/** Every issue, newest first. Used by the archive, sitemap, and static params. */
export const getAllIssues: () => IssueMetaType[] = loader.getAll;

/** A single issue by slug, or undefined if there's no such file. */
export const getIssue: (slug: string) => IssueMetaType | undefined =
	loader.getOne;
