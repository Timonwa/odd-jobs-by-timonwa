import { ArrowUpRightIcon, ShoppingBagIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HubNavbar } from "@/components/layout/HubNavbar";
import { PageMain } from "@/components/layout/PageMain";
import { Newsletter } from "@/components/_shared/content/Newsletter";
import { MoreProducts } from "@/components/shop/MoreProducts";
import { StickyCheckout } from "@/components/shop/StickyCheckout";
import { buttonClasses } from "@/components/ui";
import { CREATOR_TWITTER, SITE_NAME, SITE_URL } from "@/lib/config/site";
import { ROUTES } from "@/lib/config/routes";
import { splitTitle } from "@/lib/content/split-title";
import { getAllProducts, getProduct, getProductSlugs } from "@/lib/shop/loader";

// Known product slugs are prerendered; an unknown slug falls through to the
// notFound() below. (`dynamicParams` can't be set alongside cacheComponents.)
export function generateStaticParams() {
	return getProductSlugs().map((slug) => ({ slug }));
}

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { slug } = await params;
	const product = getProduct(slug);
	if (!product) return {};

	const title = product.title;

	return {
		title,
		description: product.description,
		keywords: product.keywords,
		// Canonical points to the authoritative www listing so this satellite page
		// doesn't compete with it in search.
		alternates: { canonical: product.canonicalUrl },
		openGraph: {
			type: "website",
			url: `${SITE_URL}${ROUTES.product(slug)}`,
			siteName: SITE_NAME,
			title,
			description: product.description,
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			site: CREATOR_TWITTER,
			creator: CREATOR_TWITTER,
			title,
			description: product.description,
		},
	};
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { slug } = await params;
	const product = getProduct(slug);
	if (!product) notFound();

	const { default: ProductBody } = await import(`@/content/shop/${slug}.mdx`);
	const { lead, accent } = splitTitle(product);

	const related = getAllProducts()
		.filter((p) => p.slug !== slug)
		.slice(0, 4);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.title,
		description: product.description,
		category: product.category,
		image: `${SITE_URL}${ROUTES.product(slug)}/opengraph-image`,
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
						<header className="mb-8">
							<span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
								<ShoppingBagIcon aria-hidden className="h-3.5 w-3.5" />
								{product.eyebrow}
							</span>
							<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
								{lead ? (
									<>
										{lead}
										<span className="hero-gradient-text">{accent}</span>
									</>
								) : (
									product.title
								)}
							</h1>
							<p className="mt-3 leading-relaxed text-muted-foreground">
								{product.description}
							</p>
						</header>

						<div
							id="buy"
							className="mb-10 flex scroll-mt-24 flex-wrap items-center gap-3"
						>
							<a
								href={product.checkoutUrl}
								target="_blank"
								rel="noopener noreferrer"
								className={buttonClasses({ size: "lg" })}
							>
								{product.checkoutLabel ?? "Get it now"}
								<ArrowUpRightIcon aria-hidden />
							</a>
							{product.price && (
								<span className="text-sm font-semibold text-foreground">
									{product.price}
								</span>
							)}
						</div>

						<article>
							<ProductBody />
						</article>

						<footer className="mt-16 border-t border-border/60 pt-8">
							<Link
								href={ROUTES.shop}
								className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
							>
								<ShoppingBagIcon aria-hidden className="h-4 w-4" />
								Browse all products
							</Link>
						</footer>
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

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</PageMain>
		</>
	);
}
