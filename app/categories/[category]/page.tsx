import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryDetail } from "@/components/categories/CategoryDetail";
import {
	type CategoryIdType,
	getCategory,
	TOOL_CATEGORIES,
} from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { CREATOR_TWITTER, SITE_NAME, SITE_URL } from "@/lib/config/site";

// Every category is prerendered; an unknown slug falls through to notFound().
export function generateStaticParams() {
	return TOOL_CATEGORIES.map((category) => ({ category: category.id }));
}

const isCategoryId = (id: string): id is CategoryIdType =>
	TOOL_CATEGORIES.some((category) => category.id === id);

type CategoryPageProps = { params: Promise<{ category: string }> };

export async function generateMetadata({
	params,
}: CategoryPageProps): Promise<Metadata> {
	const { category: id } = await params;
	if (!isCategoryId(id)) return {};

	const category = getCategory(id);
	const path = ROUTES.category(id);
	const title = `${category.label} tools`;
	const description = `${category.label} tools in the hub — ${category.description}`;

	return {
		title,
		description,
		alternates: { canonical: path },
		openGraph: {
			type: "website",
			url: `${SITE_URL}${path}`,
			siteName: SITE_NAME,
			title,
			description,
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			site: CREATOR_TWITTER,
			creator: CREATOR_TWITTER,
			title,
			description,
		},
	};
}

export default async function CategoryPage({ params }: CategoryPageProps) {
	const { category: id } = await params;
	if (!isCategoryId(id)) notFound();
	return <CategoryDetail category={getCategory(id)} />;
}
