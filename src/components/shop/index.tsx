import {
	ContentBreadcrumbs,
	JsonLdScript,
	SupportBlock,
} from "@/components/_shared/content";
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
			<PageMain>
				<ContentBreadcrumbs section="shop" />
				<ShopHero />
				<ProductGrid products={products} />
				<SupportBlock
					className="mt-16"
					heading="Another way to help"
					body="Buying a template supports the work directly. If you'd rather not, the tools and guides are free either way."
				/>
				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
