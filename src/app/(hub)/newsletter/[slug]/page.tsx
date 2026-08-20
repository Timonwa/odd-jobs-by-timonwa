import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getNoIndexSeo } from "@/lib/config/page-seo";

import { IssuePageContent } from "@/components/newsletter/issue";
import { ROUTES } from "@/lib/config/routes";
import { getIssue, getIssueSlugs } from "@/lib/server";
import { siteConfig } from "@/lib/config/site";

// Known issue slugs are prerendered; an unknown slug falls through to the
// notFound() below (`dynamicParams` can't be set alongside cacheComponents).
// That renders the 404 UI but still answers 200, so generateMetadata marks the
// response noindex — see NOINDEX_SEO.
export function generateStaticParams() {
	return getIssueSlugs().map((slug) => ({ slug }));
}

type IssuePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: IssuePageProps): Promise<Metadata> {
	const { slug } = await params;
	const issue = getIssue(slug);
	if (!issue) return getNoIndexSeo("notFound");

	const path = ROUTES.issue(slug);
	const url = `${siteConfig.url}${path}`;
	const title = issue.title;

	return {
		title,
		description: issue.description,
		keywords: issue.keywords,
		alternates: { canonical: path },
		openGraph: {
			type: "article",
			url,
			siteName: siteConfig.name,
			title,
			description: issue.description,
			locale: "en_US",
			publishedTime: issue.publishedAt,
			modifiedTime: issue.updatedAt ?? issue.publishedAt,
			authors: [siteConfig.creator.url],
		},
		twitter: {
			card: "summary_large_image",
			site: siteConfig.twitter,
			creator: siteConfig.twitter,
			title,
			description: issue.description,
		},
	};
}

export default async function IssuePage({ params }: IssuePageProps) {
	const { slug } = await params;
	const issue = getIssue(slug);
	if (!issue) notFound();

	return <IssuePageContent issue={issue} />;
}
