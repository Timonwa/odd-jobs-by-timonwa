import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/lib/constants";

import { IssuePageContent } from "@/components/newsletter/issue";
import { ROUTES } from "@/lib/config/routes";
import {
	CREATOR_TWITTER,
	CREATOR_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";
import { getIssue, getIssueSlugs } from "@/lib/server";

// Known issue slugs are prerendered; an unknown slug falls through to the
// notFound() below (`dynamicParams` can't be set alongside cacheComponents).
// That renders the 404 UI but still answers 200, so generateMetadata marks the
// response noindex — see NOT_FOUND_METADATA.
export function generateStaticParams() {
	return getIssueSlugs().map((slug) => ({ slug }));
}

type IssuePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: IssuePageProps): Promise<Metadata> {
	const { slug } = await params;
	const issue = getIssue(slug);
	if (!issue) return NOT_FOUND_METADATA;

	const path = ROUTES.issue(slug);
	const url = `${SITE_URL}${path}`;
	const title = issue.title;

	return {
		title,
		description: issue.description,
		keywords: issue.keywords,
		alternates: { canonical: path },
		openGraph: {
			type: "article",
			url,
			siteName: SITE_NAME,
			title,
			description: issue.description,
			locale: "en_US",
			publishedTime: issue.publishedAt,
			modifiedTime: issue.updatedAt ?? issue.publishedAt,
			authors: [CREATOR_URL],
		},
		twitter: {
			card: "summary_large_image",
			site: CREATOR_TWITTER,
			creator: CREATOR_TWITTER,
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
