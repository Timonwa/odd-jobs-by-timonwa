// Shop product frontmatter — validated at load time so a malformed or
// incomplete file fails the build loudly instead of shipping a broken page.

import { z } from "zod";
import { EXTERNAL_ROUTES } from "@/lib/config/routes";

export const ProductFrontmatterSchema = z.object({
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
			(url) => url.startsWith(`${EXTERNAL_ROUTES.shopCanonicalBase}/`),
			`canonicalUrl must start with ${EXTERNAL_ROUTES.shopCanonicalBase}/`,
		),
	/** Buyable versions, cheapest first — a single-price product has one entry. */
	variants: z
		.array(
			z.object({
				name: z.string(),
				price: z.string(),
				checkoutUrl: z.string().url(),
			}),
		)
		.min(1),
	/** CTA label, e.g. "Get it on Buy Me a Coffee". */
	checkoutLabel: z.string().optional(),
	ogSubtitle: z.string(),
	ogPills: z.array(z.string()),
});

/** A loaded product — frontmatter plus the slug and derived reading time. */
export type ProductMeta = z.infer<typeof ProductFrontmatterSchema> & {
	slug: string;
	readingMinutes: number;
	/** Path under the content dir — `<slug>` or `_drafts/<slug>`; only drafts differ. */
	contentPath: string;
	isDraft: boolean;
};
