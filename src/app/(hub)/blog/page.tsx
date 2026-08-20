import type { Metadata } from "next";

import { BlogPageContent } from "@/components/blog";
import {
	buildPageMetadata,
	getIndexedSeo,
	INDEXED_SEO_PATHS,
} from "@/lib/config/page-seo";

export const metadata: Metadata = buildPageMetadata(
	getIndexedSeo("blog"),
	INDEXED_SEO_PATHS.blog,
);

export default function BlogIndexPage() {
	return <BlogPageContent />;
}
