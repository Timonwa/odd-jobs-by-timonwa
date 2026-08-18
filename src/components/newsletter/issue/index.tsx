import {
	JsonLdScript,
	IssuePrevNext,
	Newsletter,
} from "@/components/_shared/content";
import { PageMain } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { ogImageUrl } from "@/lib/utils";
import { CREATOR_NAME, CREATOR_URL, SITE_URL } from "@/lib/config/site";
import type { IssueMeta } from "@/lib/schemas";
import { getAllIssues } from "@/lib/server";

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
		mainEntityOfPage: `${SITE_URL}${ROUTES.issue(issue.slug)}`,
		author: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		publisher: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		keywords: issue.keywords.join(", "),
	};

	return (
		<>
			<PageMain>
				<div className="mx-auto max-w-3xl">
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
