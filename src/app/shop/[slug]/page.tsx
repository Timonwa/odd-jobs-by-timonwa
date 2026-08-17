import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductPageContent } from "@/components/shop/product";
import { ROUTES } from "@/lib/config/routes";
import { CREATOR_TWITTER, SITE_NAME, SITE_URL } from "@/lib/config/site";
import { getProduct, getProductSlugs } from "@/lib/server";

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

	return <ProductPageContent product={product} />;
}
