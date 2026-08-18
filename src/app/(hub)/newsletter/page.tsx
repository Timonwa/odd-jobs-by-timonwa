import type { Metadata } from "next";

import { NewsletterPageContent } from "@/components/newsletter";
import { ROUTES } from "@/lib/config/routes";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { NEWSLETTER_PAGE_COPY } from "@/lib/data";

const PATH = ROUTES.newsletter;

export const metadata: Metadata = {
	title: NEWSLETTER_PAGE_COPY.title,
	description: NEWSLETTER_PAGE_COPY.description,
	alternates: { canonical: PATH },
	openGraph: {
		type: "website",
		url: `${SITE_URL}${PATH}`,
		siteName: SITE_NAME,
		title: NEWSLETTER_PAGE_COPY.title,
		description: NEWSLETTER_PAGE_COPY.description,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: NEWSLETTER_PAGE_COPY.title,
		description: NEWSLETTER_PAGE_COPY.description,
	},
};

export default function NewsletterIndexPage() {
	return <NewsletterPageContent />;
}
