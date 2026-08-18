import type { Metadata } from "next";

import { ToolRouteLayout } from "@/components/_shared/tool";
import { buildToolMetadata } from "@/lib/utils";

const SLUG = "reading-time";

/** Route metadata for the Reading Time Estimator tool. */
export const metadata: Metadata = buildToolMetadata(SLUG);

/** Layout wrapper for the Reading Time Estimator route — applies tool brand scope and injects JSON-LD. */
export default function ReadingTimeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ToolRouteLayout slug={SLUG}>{children}</ToolRouteLayout>;
}
