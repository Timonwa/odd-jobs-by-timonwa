import type { Metadata } from "next";

import { ShopPageContent } from "@/components/shop";
import { ROUTES } from "@/lib/config/routes";
import { SITE_NAME, SITE_URL, SHOP_CANONICAL_BASE } from "@/lib/config/site";
import { SHOP_PAGE_COPY } from "@/lib/data";

const PATH = ROUTES.shop;

export const metadata: Metadata = {
	title: SHOP_PAGE_COPY.title,
	description: SHOP_PAGE_COPY.description,
	// Canonicalizes to www, not to itself: this section is a duplicate of the
	// authoritative shop on www.timonwa.com, which is where the originals live.
	// The product pages already do this; the index was the inconsistency.
	alternates: { canonical: SHOP_CANONICAL_BASE },
	openGraph: {
		type: "website",
		url: `${SITE_URL}${PATH}`,
		siteName: SITE_NAME,
		title: SHOP_PAGE_COPY.title,
		description: SHOP_PAGE_COPY.description,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: SHOP_PAGE_COPY.title,
		description: SHOP_PAGE_COPY.description,
	},
};

export default function ShopIndexPage() {
	return <ShopPageContent />;
}
