// Client-safe — no filesystem access, so safe to import from client components. The product list is discovered by lib/shop/loader.ts (server-only); this shape must stay in sync with the frontmatter schema there.

export type ProductMeta = {
	slug: string;
	title: string;
	titleAccent: string;
	eyebrow: string;
	description: string;
	keywords: string[];
	category: string;
	publishedAt: string;
	updatedAt?: string;
	/** Absolute www.timonwa.com/shop/<slug> — the authoritative listing this page canonicalizes to. */
	canonicalUrl: string;
	/** Display price, e.g. "Free" or "$5". */
	price?: string;
	/** External checkout link (Buy Me a Coffee / Selar). */
	checkoutUrl: string;
	/** CTA label, e.g. "Get it on Buy Me a Coffee". */
	checkoutLabel?: string;
	ogSubtitle: string;
	ogPills: string[];
	ogAccent: string;
	ogBackgroundTint: string;
};
