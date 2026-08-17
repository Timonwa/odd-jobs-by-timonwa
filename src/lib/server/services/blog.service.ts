// Loads blog post content and metadata (MDX) for the Blog section.

import "server-only";

import { PostFrontmatterSchema, type PostMetaType } from "@/lib/schemas";
import { createMdxLoader } from "../utils/create-mdx-loader";

const loader = createMdxLoader({ dir: "blog", schema: PostFrontmatterSchema });

/** Slugs of every post in the content directory (filenames minus `.mdx`). */
export const getPostSlugs = loader.getSlugs;

/** Every post, newest first. Used by the index, sitemap, and static params. */
export const getAllPosts: () => PostMetaType[] = loader.getAll;

/** A single post by slug, or undefined if there's no such file. */
export const getPost: (slug: string) => PostMetaType | undefined =
	loader.getOne;
