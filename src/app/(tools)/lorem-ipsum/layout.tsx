import type { Metadata } from "next";

import { ToolRouteLayout } from "@/components/_shared/tool";
import { buildToolMetadata } from "@/lib/utils";

const SLUG = "lorem-ipsum";

/** Route metadata for the Lorem Ipsum Generator tool. */
export const metadata: Metadata = buildToolMetadata(SLUG);

/** Layout wrapper for the Lorem Ipsum Generator route — applies tool brand scope and injects JSON-LD. */
export default function LoremIpsumLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ToolRouteLayout slug={SLUG}>{children}</ToolRouteLayout>;
}
