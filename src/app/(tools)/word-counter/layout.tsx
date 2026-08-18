import type { Metadata } from "next";

import { ToolRouteLayout } from "@/components/_shared/tool";
import { buildToolMetadata } from "@/lib/utils";

const SLUG = "word-counter";

/** Route metadata for the Word & Character Counter tool. */
export const metadata: Metadata = buildToolMetadata(SLUG);

/** Layout wrapper for the Word & Character Counter route — applies tool brand scope and injects JSON-LD. */
export default function WordCounterLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ToolRouteLayout slug={SLUG}>{children}</ToolRouteLayout>;
}
