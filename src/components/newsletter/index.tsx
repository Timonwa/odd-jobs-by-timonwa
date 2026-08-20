import {
	ContentBreadcrumbs,
	JsonLdScript,
	Newsletter,
} from "@/components/_shared/content";
import { PageMain } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { buildItemListJsonLd } from "@/lib/utils";

import { getAllIssues } from "@/lib/server";

import { IssueGrid } from "./IssueGrid";
import { NewsletterHero } from "./NewsletterHero";

export function NewsletterPageContent() {
	const issues = getAllIssues();
	const jsonLd = buildItemListJsonLd(
		"Newsletter",
		issues.map((issue) => ({
			href: ROUTES.issue(issue.slug),
			title: issue.title,
		})),
	);

	return (
		<>
			<PageMain>
				<ContentBreadcrumbs section="newsletter" />
				<NewsletterHero />
				<Newsletter className="mb-16" />
				<IssueGrid issues={issues} />
				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
