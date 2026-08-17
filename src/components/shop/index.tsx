import { JsonLdScript } from "@/components/_shared/content/JsonLdScript";
import { Newsletter } from "@/components/_shared/content/Newsletter";
import { HubNavbar } from "@/components/_shared/layout/HubNavbar";
import { PageMain } from "@/components/_shared/layout/PageMain";
import { ROUTES } from "@/lib/config/routes";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { getAllProducts } from "@/lib/server";

import { ProductGrid } from "./ProductGrid";
import { ShopHero } from "./ShopHero";

export function ShopPageContent() {
	const products = getAllProducts();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `Shop — ${SITE_NAME}`,
		itemListElement: products.map((product, i) => ({
			"@type": "ListItem",
			position: i + 1,
			url: `${SITE_URL}${ROUTES.product(product.slug)}`,
			name: product.title,
		})),
	};

	return (
		<>
			<HubNavbar />
			<PageMain>
				<ShopHero />
				<ProductGrid products={products} />
				<Newsletter className="mt-16" />
				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
