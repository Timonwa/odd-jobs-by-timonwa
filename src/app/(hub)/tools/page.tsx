import type { Metadata } from "next";

import { ToolsDirectoryPageContent } from "@/components/tools";
import {
	buildPageMetadata,
	getIndexedSeo,
	INDEXED_SEO_PATHS,
} from "@/lib/config/page-seo";

export const metadata: Metadata = buildPageMetadata(
	getIndexedSeo("tools"),
	INDEXED_SEO_PATHS.tools,
);

export default function ToolsPage() {
	return <ToolsDirectoryPageContent />;
}
