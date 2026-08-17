// Loads newsletter issue content and metadata (MDX) for the archive.

import "server-only";

import { z } from "zod";

import { createMdxLoader } from "@/lib/content/create-mdx-loader";
import type { IssueMeta } from "./issues";

// Validates each issue's frontmatter so a malformed or incomplete file fails
// the build loudly instead of shipping a broken page. Mirrors IssueMeta.
const FrontmatterSchema = z.object({
	title: z.string(),
	titleAccent: z.string(),
	eyebrow: z.string(),
	description: z.string(),
	keywords: z.array(z.string()),
	category: z.string(),
	publishedAt: z.string(),
	updatedAt: z.string().optional(),
	issueNumber: z.number().optional(),
	subject: z.string(),
	preview: z.string(),
	ogSubtitle: z.string(),
	ogPills: z.array(z.string()),
	ogAccent: z.string(),
	ogBackgroundTint: z.string(),
});

const loader = createMdxLoader({
	dir: "issues",
	schema: FrontmatterSchema,
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
export const getAllIssues: () => IssueMeta[] = loader.getAll;

/** A single issue by slug, or undefined if there's no such file. */
export const getIssue: (slug: string) => IssueMeta | undefined = loader.getOne;
