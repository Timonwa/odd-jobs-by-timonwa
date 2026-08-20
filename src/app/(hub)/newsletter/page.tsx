import type { Metadata } from "next";

import { NewsletterPageContent } from "@/components/newsletter";
import {
	buildPageMetadata,
	getIndexedSeo,
	INDEXED_SEO_PATHS,
} from "@/lib/config/page-seo";

export const metadata: Metadata = buildPageMetadata(
	getIndexedSeo("newsletter"),
	INDEXED_SEO_PATHS.newsletter,
);

export default function NewsletterIndexPage() {
	return <NewsletterPageContent />;
}
