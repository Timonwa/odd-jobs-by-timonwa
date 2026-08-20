import {
	ContentBreadcrumbs,
	JsonLdScript,
	Newsletter,
	RelatedAside,
} from "@/components/_shared/content";
import { PageMain } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { ogImageUrl } from "@/lib/utils";
import { getAllProducts } from "@/lib/server";
import type { ProductMeta } from "@/lib/schemas";
import { ShareBar } from "@/components/_shared/tool";
import { siteConfig } from "@/lib/config/site";

import { ProductCheckoutCta } from "./ProductCheckoutCta";
import { ProductHeader } from "./ProductHeader";
import { ProductPageFooter } from "./ProductPageFooter";
import { StickyCheckout } from "./StickyCheckout";

/**
 * Turns a display price into schema.org offer fields, and only when the string
 * says one unambiguous thing.
 *
 * The frontmatter is free text, and one product reads "Free · $5 Pro" — a
 * grab-the-first-number parse would publish `price: 5` for something that is
 * free, which is worse than publishing no price at all. So: exactly "Free", or
 * exactly one "$N", or nothing.
 */
function parseOfferPrice(
	display: string,
): { price: string; priceCurrency: string } | Record<string, never> {
	const value = display.trim();
	if (!value) return {};
	if (/^free$/i.test(value)) return { price: "0", priceCurrency: "USD" };
	const exact = value.match(/^\$(\d+(?:\.\d{1,2})?)$/);
	if (!exact?.[1]) return {};
	return { price: exact[1], priceCurrency: "USD" };
}

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
		.slice(0, 4)
		.map((p) => ({
			href: ROUTES.product(p.slug),
			eyebrow: p.category,
			title: p.title,
			isDraft: p.isDraft,
			metaRight: p.variants[0]?.price,
		}));

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		category: product.category,
		image: ogImageUrl(ROUTES.product(product.slug)),
		url: product.canonicalUrl,
		brand: { "@type": "Brand", name: siteConfig.name },
		// One offer per variant, so a tiered product publishes every price rather
		// than none — a display string that isn't "Free" or "$N" claims no price.
		offers: product.variants.map((variant) => ({
			"@type": "Offer",
			name: variant.name,
			url: variant.checkoutUrl,
			availability: "https://schema.org/InStock",
			...parseOfferPrice(variant.price),
		})),
	};

	return (
		<>
			<PageMain>
				<ContentBreadcrumbs
					section="shop"
					title={product.title}
					action={
						<ShareBar
							url={`${siteConfig.url}${ROUTES.product(product.slug)}`}
							title={product.title}
							shareText={product.description}
							subject="product"
						/>
					}
				/>
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
								<RelatedAside
									id="more-products"
									heading="More in the shop"
									items={related}
								/>
							</div>
						</div>
					)}
				</div>

				<Newsletter className="mt-16" />

				<StickyCheckout label="Get it now" />

				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
