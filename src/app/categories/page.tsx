import type { Metadata } from "next";

import { CategoriesPageContent } from "@/components/categories";
import { ROUTES } from "@/lib/config/routes";
import { CREATOR_TWITTER, SITE_NAME, SITE_URL } from "@/lib/config/site";

const PATH = ROUTES.categories;
const URL = `${SITE_URL}${PATH}`;
const TITLE = "Tool categories — browse by what you need";
const DESCRIPTION =
	"Browse the hub by category: AI writing helpers, SEO, developer utilities, text, and media tools for writers, developers, and creators.";

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

export default function CategoriesPage() {
	return <CategoriesPageContent />;
}
