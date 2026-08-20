import type { Metadata } from "next";

import { CategoriesPageContent } from "@/components/categories";
import {
	buildPageMetadata,
	getIndexedSeo,
	INDEXED_SEO_PATHS,
} from "@/lib/config/page-seo";

export const metadata: Metadata = buildPageMetadata(
	getIndexedSeo("categories"),
	INDEXED_SEO_PATHS.categories,
);

export default function CategoriesPage() {
	return <CategoriesPageContent />;
}
