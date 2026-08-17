import type { Metadata } from "next";

import { ToolsDirectoryPageContent } from "@/components/tools";
import { ROUTES } from "@/lib/config/routes";
import { CREATOR_TWITTER, SITE_NAME, SITE_URL } from "@/lib/config/site";

const PATH = ROUTES.tools;
const URL = `${SITE_URL}${PATH}`;
const TITLE = "All tools — the full directory";
const DESCRIPTION =
	"Browse every tool in the hub and filter by category: AI writing helpers, SEO, developer, and text utilities for writers, developers, and creators.";

export const metadata: Metadata = {
	title: TITLE,
	description: DESCRIPTION,
	alternates: { canonical: PATH },
	openGraph: {
		type: "website",
		url: URL,
		siteName: SITE_NAME,
		title: TITLE,
		description: DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		site: CREATOR_TWITTER,
		creator: CREATOR_TWITTER,
		title: TITLE,
		description: DESCRIPTION,
	},
};

export default function ToolsPage() {
	return <ToolsDirectoryPageContent />;
}
