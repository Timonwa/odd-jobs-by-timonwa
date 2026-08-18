// Shop product frontmatter — validated at load time so a malformed or
// incomplete file fails the build loudly instead of shipping a broken page.

import { z } from "zod";

import { SHOP_CANONICAL_BASE } from "@/lib/config/site";

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
			(url) => url.startsWith(`${SHOP_CANONICAL_BASE}/`),
			`canonicalUrl must start with ${SHOP_CANONICAL_BASE}/`,
		),
	/** Display price, e.g. "Free" or "$5". */
	price: z.string().optional(),
	/** External checkout link (Buy Me a Coffee / Selar). */
	checkoutUrl: z.string().url(),
	/** CTA label, e.g. "Get it on Buy Me a Coffee". */
	checkoutLabel: z.string().optional(),
	ogSubtitle: z.string(),
	ogPills: z.array(z.string()),
	ogAccent: z.string(),
	ogBackgroundTint: z.string(),
});

/** A loaded product — frontmatter plus the slug and derived reading time. */
export type ProductMeta = z.infer<typeof ProductFrontmatterSchema> & {
	slug: string;
	readingMinutes: number;
	/** Path under the content dir — `<slug>` or `_drafts/<slug>`; only drafts differ. */
	contentPath: string;
};
