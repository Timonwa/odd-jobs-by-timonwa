import type { Metadata } from "next";

import { ToolRouteLayout } from "@/components/_shared/tool";
import { buildToolMetadata } from "@/lib/utils";

const SLUG = "case-converter";

/** Route metadata for the Case Converter tool. */
export const metadata: Metadata = buildToolMetadata(SLUG);

/** Layout wrapper for the Case Converter route — applies tool brand scope and injects JSON-LD. */
export default function CaseConverterLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ToolRouteLayout slug={SLUG}>{children}</ToolRouteLayout>;
}
