import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getNoIndexSeo } from "@/lib/config/page-seo";

import { ProductPageContent } from "@/components/shop/product";
import { ROUTES } from "@/lib/config/routes";
import { getProduct, getProductSlugs } from "@/lib/server";
import { siteConfig } from "@/lib/config/site";

// Known product slugs are prerendered; an unknown slug falls through to the
// notFound() below (`dynamicParams` can't be set alongside cacheComponents).
// That renders the 404 UI but still answers 200, so generateMetadata marks the
// response noindex — see NOINDEX_SEO.
export function generateStaticParams() {
	return getProductSlugs().map((slug) => ({ slug }));
}

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { slug } = await params;
	const product = getProduct(slug);
	if (!product) return getNoIndexSeo("notFound");

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
			url: `${siteConfig.url}${ROUTES.product(slug)}`,
			siteName: siteConfig.name,
			title,
			description: product.description,
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			site: siteConfig.twitter,
			creator: siteConfig.twitter,
			title,
			description: product.description,
		},
	};
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { slug } = await params;
	const product = getProduct(slug);
	if (!product) notFound();

	return <ProductPageContent product={product} />;
}
