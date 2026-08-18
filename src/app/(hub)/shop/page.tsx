import type { Metadata } from "next";

import { ShopPageContent } from "@/components/shop";
import { ROUTES } from "@/lib/config/routes";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { SHOP_PAGE_COPY } from "@/lib/data";

const PATH = ROUTES.shop;

export const metadata: Metadata = {
	title: SHOP_PAGE_COPY.title,
	description: SHOP_PAGE_COPY.description,
	alternates: { canonical: PATH },
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
