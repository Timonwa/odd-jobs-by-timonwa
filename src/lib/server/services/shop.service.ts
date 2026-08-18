// Loads shop product content and metadata (MDX) for the Shop section.

import "server-only";

import { ProductFrontmatterSchema, type ProductMeta } from "@/lib/schemas";
import { createMdxLoader } from "../utils/create-mdx-loader.utils";

const loader = createMdxLoader({
	dir: "shop",
	schema: ProductFrontmatterSchema,
});

/** Slugs of every product in the content directory (filenames minus `.mdx`). */
export const getProductSlugs = loader.getSlugs;

/** Every product, newest first. Used by the index, nav, and static params. */
export const getAllProducts: () => ProductMeta[] = loader.getAll;

/** A single product by slug, or undefined if there's no such file. */
export const getProduct: (slug: string) => ProductMeta | undefined =
	loader.getOne;
