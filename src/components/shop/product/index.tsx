import { JsonLdScript, Newsletter } from "@/components/_shared/content";
import { PageMain } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { ogImageUrl } from "@/lib/utils";
import { SITE_NAME } from "@/lib/config/site";
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
		`@/content/shop/${product.contentPath}.mdx`
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
		image: ogImageUrl(ROUTES.product(product.slug)),
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
