import type { Metadata } from "next";

import { BlogPageContent } from "@/components/blog";
import { ROUTES } from "@/lib/config/routes";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { BLOG_PAGE_COPY } from "@/lib/data";

const PATH = ROUTES.blog;

export const metadata: Metadata = {
	title: BLOG_PAGE_COPY.title,
	description: BLOG_PAGE_COPY.description,
	alternates: { canonical: PATH },
	openGraph: {
		type: "website",
		url: `${SITE_URL}${PATH}`,
		siteName: SITE_NAME,
		title: BLOG_PAGE_COPY.title,
		description: BLOG_PAGE_COPY.description,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: BLOG_PAGE_COPY.title,
		description: BLOG_PAGE_COPY.description,
	},
};

export default function BlogIndexPage() {
	return <BlogPageContent />;
}
