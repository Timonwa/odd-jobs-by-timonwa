// Loads blog post content and metadata (MDX) for the Blog section.

import "server-only";

import { z } from "zod";

import { createMdxLoader } from "@/lib/content/create-mdx-loader";
import type { PostMeta } from "./blog";

// Validates each post's frontmatter so a malformed or incomplete file fails
// the build loudly instead of shipping a broken page. Mirrors PostMeta.
const FrontmatterSchema = z.object({
	title: z.string(),
	titleAccent: z.string(),
	eyebrow: z.string(),
	description: z.string(),
	keywords: z.array(z.string()),
	category: z.string(),
	publishedAt: z.string(),
	updatedAt: z.string().optional(),
	ogSubtitle: z.string(),
	ogPills: z.array(z.string()),
	ogAccent: z.string(),
	ogBackgroundTint: z.string(),
});

const loader = createMdxLoader({ dir: "blog", schema: FrontmatterSchema });

/** Slugs of every post in the content directory (filenames minus `.mdx`). */
export const getPostSlugs = loader.getSlugs;

/** Every post, newest first. Used by the index, sitemap, and static params. */
export const getAllPosts: () => PostMeta[] = loader.getAll;

/** A single post by slug, or undefined if there's no such file. */
export const getPost: (slug: string) => PostMeta | undefined = loader.getOne;
