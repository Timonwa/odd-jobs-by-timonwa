import { JsonLdScript, Newsletter } from "@/components/_shared/content";
import { HubNavbar } from "@/components/_shared/layout";
import { PageMain } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { getAllIssues } from "@/lib/server";

import { IssueGrid } from "./IssueGrid";
import { NewsletterHero } from "./NewsletterHero";

export function NewsletterPageContent() {
	const issues = getAllIssues();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `Newsletter — ${SITE_NAME}`,
		itemListElement: issues.map((issue, i) => ({
			"@type": "ListItem",
			position: i + 1,
			url: `${SITE_URL}${ROUTES.issue(issue.slug)}`,
			name: issue.title,
		})),
	};

	return (
		<>
			<HubNavbar />
			<PageMain>
				<NewsletterHero />
				<Newsletter className="mb-16" />
				<IssueGrid issues={issues} />
				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
