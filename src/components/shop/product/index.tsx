import { JsonLdScript } from "@/components/_shared/content/JsonLdScript";
import { Newsletter } from "@/components/_shared/content/Newsletter";
import { HubNavbar } from "@/components/_shared/layout/HubNavbar";
import { PageMain } from "@/components/_shared/layout/PageMain";
import { ROUTES } from "@/lib/config/routes";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { getAllProducts } from "@/lib/server";
import type { ProductMeta } from "@/lib/schemas";

import { MoreProducts } from "./MoreProducts";
import { ProductCheckoutCta } from "./ProductCheckoutCta";
import { ProductHeader } from "./ProductHeader";
import { ProductPageFooter } from "./ProductPageFooter";
import { StickyCheckout } from "./StickyCheckout";

export async function ProductPageContent({
	product,
}: {
	product: ProductMeta;
}) {
	const { default: ProductBody } = await import(
		`@/content/shop/${product.slug}.mdx`
	);

	const related = getAllProducts()
		.filter((p) => p.slug !== product.slug)
		.slice(0, 4);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		category: product.category,
		image: `${SITE_URL}${ROUTES.product(product.slug)}/opengraph-image`,
		url: product.canonicalUrl,
		brand: { "@type": "Brand", name: SITE_NAME },
		offers: {
			"@type": "Offer",
			url: product.checkoutUrl,
			availability: "https://schema.org/InStock",
		},
	};

	return (
		<>
			<HubNavbar />
			<PageMain>
				<div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
					<div className="flex flex-col lg:col-span-2">
						<ProductHeader product={product} />
						<ProductCheckoutCta product={product} />
						<article>
							<ProductBody />
						</article>
						<ProductPageFooter />
					</div>

					{related.length > 0 && (
						<div className="lg:col-span-1">
							<div className="lg:sticky lg:top-24">
								<MoreProducts products={related} />
							</div>
						</div>
					)}
				</div>

				<Newsletter className="mt-16" />

				<StickyCheckout
					checkoutUrl={product.checkoutUrl}
					price={product.price}
				/>

				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
