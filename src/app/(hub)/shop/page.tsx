import type { Metadata } from "next";

import { ShopPageContent } from "@/components/shop";
import {
	buildPageMetadata,
	getIndexedSeo,
	INDEXED_SEO_PATHS,
} from "@/lib/config/page-seo";
import { EXTERNAL_ROUTES } from "@/lib/config/routes";

// Canonicalizes to www, not to itself: this section is a duplicate of the
// authoritative shop on www.timonwa.com, which is where the originals live.
export const metadata: Metadata = buildPageMetadata(
	getIndexedSeo("shop"),
	INDEXED_SEO_PATHS.shop,
	{ canonical: EXTERNAL_ROUTES.shopCanonicalBase },
);

export default function ShopIndexPage() {
	return <ShopPageContent />;
}
