// Loads newsletter issue content and metadata (MDX) for the archive.

import "server-only";

import { cache } from "react";

import { IssueFrontmatterSchema, type IssueMeta } from "@/lib/schemas";
import { createMdxLoader } from "../utils/create-mdx-loader.utils";

const loader = createMdxLoader({
	dir: "issues",
	schema: IssueFrontmatterSchema,
});

/** Slugs of every issue in the content directory (filenames minus `.mdx`). */
export const getIssueSlugs = loader.getSlugs;

/** Every issue, newest first, each numbered by its place in publish order. */
export const getAllIssues: () => IssueMeta[] = cache(() => {
	const oldestFirst = [...loader.getAll()].sort((a, b) =>
		a.publishedAt < b.publishedAt ? -1 : 1,
	);
	const numberBySlug = new Map(
		oldestFirst.map((issue, index) => [issue.slug, index + 1]),
	);

	return oldestFirst
		.map((issue) => ({
			...issue,
			issueNumber: numberBySlug.get(issue.slug) as number,
		}))
		.reverse();
});

/** A single issue by slug, with the same derived number the archive shows. */
export const getIssue = (slug: string): IssueMeta | undefined =>
	getAllIssues().find((issue) => issue.slug === slug);
