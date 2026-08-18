import { JsonLdScript, Newsletter } from "@/components/_shared/content";
import { HubNavbar } from "@/components/_shared/layout";
import { PageMain } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { buildItemListJsonLd } from "@/lib/utils";

import { getAllProducts } from "@/lib/server";

import { ProductGrid } from "./ProductGrid";
import { ShopHero } from "./ShopHero";

export function ShopPageContent() {
	const products = getAllProducts();
	const jsonLd = buildItemListJsonLd(
		"Shop",
		products.map((product) => ({
			href: ROUTES.product(product.slug),
			title: product.title,
		})),
	);

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
