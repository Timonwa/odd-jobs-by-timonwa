import type { Metadata } from "next";

import { ToolRouteLayout } from "@/components/_shared/tool";
import { buildToolMetadata } from "@/lib/utils";

const SLUG = "hash-generator";

/** Route metadata for the Hash Generator tool. */
export const metadata: Metadata = buildToolMetadata(SLUG);

/** Layout wrapper for the Hash Generator route — applies tool brand scope and injects JSON-LD. */
export default function HashGeneratorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ToolRouteLayout slug={SLUG}>{children}</ToolRouteLayout>;
}
