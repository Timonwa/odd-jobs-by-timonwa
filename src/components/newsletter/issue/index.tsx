import {
	ContentBreadcrumbs,
	JsonLdScript,
	IssuePrevNext,
	Newsletter,
} from "@/components/_shared/content";
import { PageMain } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { ogImageUrl } from "@/lib/utils";
import type { IssueMeta } from "@/lib/schemas";
import { getAllIssues } from "@/lib/server";
import { ShareBar } from "@/components/_shared/tool";
import { siteConfig } from "@/lib/config/site";

import { IssueHero } from "./IssueHero";
import { IssuePageFooter } from "./IssuePageFooter";

export async function IssuePageContent({ issue }: { issue: IssueMeta }) {
	const { default: IssueBody } = await import(
		`@/content/issues/${issue.contentPath}.mdx`
	);

	// Issues are newest-first, so the newer issue sits before this one in the list.
	const all = getAllIssues();
	const index = all.findIndex((i) => i.slug === issue.slug);
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
		image: ogImageUrl(ROUTES.issue(issue.slug)),
		mainEntityOfPage: `${siteConfig.url}${ROUTES.issue(issue.slug)}`,
		author: {
			"@type": "Person",
			name: siteConfig.creator.name,
			url: siteConfig.creator.url,
		},
		publisher: {
			"@type": "Person",
			name: siteConfig.creator.name,
			url: siteConfig.creator.url,
		},
		keywords: issue.keywords.join(", "),
	};

	return (
		<>
			<PageMain>
				<div className="mx-auto max-w-3xl">
					<ContentBreadcrumbs
						section="newsletter"
						title={issue.title}
						action={
							<ShareBar
								url={`${siteConfig.url}${ROUTES.issue(issue.slug)}`}
								title={issue.title}
								shareText={issue.description}
								subject="issue"
							/>
						}
					/>
					<IssueHero issue={issue} />
					<article>
						<IssueBody />
					</article>
					<IssuePrevNext prev={prevIssue} next={nextIssue} />
					<Newsletter className="mt-16" />
					<IssuePageFooter />
				</div>
				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
