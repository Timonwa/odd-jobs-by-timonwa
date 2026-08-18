import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryDetail } from "@/components/categories/CategoryDetail";
import {
	type CategoryId,
	getCategory,
	TOOL_CATEGORIES,
} from "@/lib/config/categories";
import { getToolsInCategory } from "@/lib/config/tools";
import { ROUTES } from "@/lib/config/routes";
import { CREATOR_TWITTER, SITE_NAME, SITE_URL } from "@/lib/config/site";

// Every category is prerendered; an unknown slug falls through to notFound().
export function generateStaticParams() {
	return TOOL_CATEGORIES.map((category) => ({ category: category.id }));
}

const isCategoryId = (id: string): id is CategoryId =>
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
		// A category with no live tools is a thin page. It stays reachable (the
		// grid links it, and tools land in it later) but shouldn't be indexed
		// while there is nothing on it.
		...(getToolsInCategory(category.id).length === 0 && {
			robots: { index: false, follow: true },
		}),
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
