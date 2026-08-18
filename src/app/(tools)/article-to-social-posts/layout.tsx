import type { Metadata } from "next";

import { ToolRouteLayout } from "@/components/_shared/tool";
import { buildToolMetadata } from "@/lib/utils";

const SLUG = "article-to-social-posts";

/** Route metadata for the Article to Social Posts tool. */
export const metadata: Metadata = buildToolMetadata(SLUG);

/** Layout wrapper for the Article to Social Posts route — applies tool brand scope and injects JSON-LD. */
export default function ArticleToSocialPostsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ToolRouteLayout slug={SLUG}>{children}</ToolRouteLayout>;
}
