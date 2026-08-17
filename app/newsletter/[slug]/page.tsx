import { MailIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HubNavbar } from "@/components/layout/HubNavbar";
import { PageMain } from "@/components/layout/PageMain";
import { Newsletter } from "@/components/_shared/content/Newsletter";
import { PageHero } from "@/components/ui";
import {
	CREATOR_NAME,
	CREATOR_TWITTER,
	CREATOR_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";
import { ROUTES } from "@/lib/config/routes";
import { IssuePrevNext } from "@/components/_shared/content/IssuePrevNext";
import { splitTitle } from "@/lib/content/split-title";
import { getAllIssues, getIssue, getIssueSlugs } from "@/lib/issues/loader";

// Known issue slugs are prerendered; an unknown slug falls through to the
// notFound() below. (`dynamicParams` can't be set alongside cacheComponents.)
export function generateStaticParams() {
	return getIssueSlugs().map((slug) => ({ slug }));
}

type IssuePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: IssuePageProps): Promise<Metadata> {
	const { slug } = await params;
	const issue = getIssue(slug);
	if (!issue) return {};

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

	const { default: IssueBody } = await import(`@/content/issues/${slug}.mdx`);
	const { lead, accent } = splitTitle(issue);

	// Issues are newest-first, so the newer issue sits before this one in the list.
	const all = getAllIssues();
	const index = all.findIndex((i) => i.slug === slug);
	const newer = index > 0 ? all[index - 1] : undefined;
	const older =
		index >= 0 && index < all.length - 1 ? all[index + 1] : undefined;
	const nextIssue = newer
		? { href: ROUTES.issue(newer.slug), title: newer.title }
		: null;
	const prevIssue = older
		? { href: ROUTES.issue(older.slug), title: older.title }
		: null;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: issue.title,
		description: issue.description,
		datePublished: issue.publishedAt,
		dateModified: issue.updatedAt ?? issue.publishedAt,
		inLanguage: "en",
		image: `${SITE_URL}${ROUTES.issue(slug)}/opengraph-image`,
		mainEntityOfPage: `${SITE_URL}${ROUTES.issue(slug)}`,
		author: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		publisher: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		keywords: issue.keywords.join(", "),
	};

	return (
		<>
			<HubNavbar />
			<PageMain>
				<div className="mx-auto max-w-3xl">
					<PageHero
						className="mb-10"
						eyebrow={{
							icon: MailIcon,
							label:
								issue.issueNumber != null
									? `Issue #${issue.issueNumber}`
									: issue.eyebrow,
						}}
						title={
							lead ? (
								<>
									{lead}
									<span className="hero-gradient-text">{accent}</span>
								</>
							) : (
								issue.title
							)
						}
						subtitle={issue.description}
					/>

					<article>
						<IssueBody />
					</article>

					<IssuePrevNext prev={prevIssue} next={nextIssue} />

					<Newsletter className="mt-16" />

					<footer className="mt-16 border-t border-border/60 pt-8">
						<Link
							href={ROUTES.newsletter}
							className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
						>
							<MailIcon aria-hidden className="h-4 w-4" />
							Browse all issues
						</Link>
					</footer>
				</div>

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</PageMain>
		</>
	);
}
