// Loads shop product content and metadata (MDX) for the Shop section.

import "server-only";

import { z } from "zod";

import { createMdxLoader } from "@/lib/content/create-mdx-loader";
import { SHOP_CANONICAL_BASE } from "@/lib/config/site";
import type { ProductMeta } from "./products";

// Validates each product's frontmatter so a malformed or incomplete file fails
// the build loudly instead of shipping a broken page. Mirrors ProductMeta.
const FrontmatterSchema = z.object({
	title: z.string(),
	titleAccent: z.string(),
	eyebrow: z.string(),
	description: z.string(),
	keywords: z.array(z.string()),
	category: z.string(),
	publishedAt: z.string(),
	updatedAt: z.string().optional(),
	// Must point at the equivalent www listing so the local page canonicalizes
	// to the authoritative one and doesn't compete with it in search.
	canonicalUrl: z
		.string()
		.url()
		.refine(
			(url) => url.startsWith(`${SHOP_CANONICAL_BASE}/`),
			`canonicalUrl must start with ${SHOP_CANONICAL_BASE}/`,
		),
	price: z.string().optional(),
	checkoutUrl: z.string().url(),
	checkoutLabel: z.string().optional(),
	ogSubtitle: z.string(),
	ogPills: z.array(z.string()),
	ogAccent: z.string(),
	ogBackgroundTint: z.string(),
});

const loader = createMdxLoader({ dir: "shop", schema: FrontmatterSchema });

/** Slugs of every product in the content directory (filenames minus `.mdx`). */
export const getProductSlugs = loader.getSlugs;

/** Every product, newest first. Used by the index, nav, and static params. */
export const getAllProducts: () => ProductMeta[] = loader.getAll;

/** A single product by slug, or undefined if there's no such file. */
export const getProduct: (slug: string) => ProductMeta | undefined =
	loader.getOne;
