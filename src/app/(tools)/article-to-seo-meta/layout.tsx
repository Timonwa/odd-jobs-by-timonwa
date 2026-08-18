import type { Metadata } from "next";

import { ToolRouteLayout } from "@/components/_shared/tool";
import { buildToolMetadata } from "@/lib/utils";

const SLUG = "article-to-seo-meta";

/** Route metadata for the Article to SEO Meta tool. */
export const metadata: Metadata = buildToolMetadata(SLUG);

/** Layout wrapper for the Article to SEO Meta route — applies tool brand scope and injects JSON-LD. */
export default function ArticleToSeoMetaLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ToolRouteLayout slug={SLUG}>{children}</ToolRouteLayout>;
}
