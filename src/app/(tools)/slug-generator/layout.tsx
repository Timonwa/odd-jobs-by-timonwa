import type { Metadata } from "next";

import { ToolRouteLayout } from "@/components/_shared/tool";
import { buildToolMetadata } from "@/lib/utils";

const SLUG = "slug-generator";

/** Route metadata for the Slug Generator tool. */
export const metadata: Metadata = buildToolMetadata(SLUG);

/** Layout wrapper for the Slug Generator route — applies tool brand scope and injects JSON-LD. */
export default function SlugGeneratorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ToolRouteLayout slug={SLUG}>{children}</ToolRouteLayout>;
}
