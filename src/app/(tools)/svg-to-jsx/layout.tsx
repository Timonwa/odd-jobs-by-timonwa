import type { Metadata } from "next";

import { ToolRouteLayout } from "@/components/_shared/tool";
import { buildToolMetadata } from "@/lib/utils";

const SLUG = "svg-to-jsx";

/** Route metadata for the SVG to JSX Converter tool. */
export const metadata: Metadata = buildToolMetadata(SLUG);

/** Layout wrapper for the SVG to JSX Converter route — applies tool brand scope and injects JSON-LD. */
export default function SvgToJsxLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <ToolRouteLayout slug={SLUG}>{children}</ToolRouteLayout>;
}
