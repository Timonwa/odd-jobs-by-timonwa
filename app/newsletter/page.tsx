import { ArrowRightIcon, ClockIcon, MailIcon } from "lucide-react";
import type { Metadata } from "next";

import HubNavbar from "@/components/layout/HubNavbar";
import PageMain from "@/components/layout/PageMain";
import Newsletter from "@/components/_shared/content/Newsletter";
import { LinkCard, PageHero } from "@/components/ui";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { ROUTES } from "@/lib/config/routes";
import { getAllIssues } from "@/lib/issues/loader";

const PATH = ROUTES.newsletter;
const TITLE = "Newsletter";
const DESCRIPTION =
	"The Productivity Bug newsletter — new tools, posts, and productivity notes in your inbox. Read past issues or subscribe below.";

export const metadata: Metadata = {
	title: TITLE,
	description: DESCRIPTION,
	alternates: { canonical: PATH },
	openGraph: {
		type: "website",
		url: `${SITE_URL}${PATH}`,
		siteName: SITE_NAME,
		title: TITLE,
		description: DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: TITLE,
		description: DESCRIPTION,
	},
};

const dateFormat = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
});

export default function NewsletterIndexPage() {
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
				<PageHero
					className="mb-10"
					eyebrow={{ icon: MailIcon, label: "Newsletter" }}
					title={
						<>
							Productivity, in your{" "}
							<span className="hero-gradient-text">inbox</span>
						</>
					}
					subtitle={DESCRIPTION}
				/>

				<Newsletter className="mb-16" />

				{issues.length > 0 && (
					<>
						<h2 className="mb-4 text-lg font-semibold tracking-tight">
							Past issues
						</h2>
						<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{issues.map((issue) => (
								<li key={issue.slug}>
									<LinkCard href={ROUTES.issue(issue.slug)}>
										<span className="text-xs font-medium uppercase tracking-wide text-primary">
											{issue.issueNumber != null
												? `Issue #${issue.issueNumber}`
												: dateFormat.format(new Date(issue.publishedAt))}
										</span>
										<h3 className="mt-2 text-lg font-semibold tracking-tight">
											{issue.title}
										</h3>
										<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
											{issue.description}
										</p>
										<span className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
											<ClockIcon aria-hidden className="h-3.5 w-3.5" />
											{issue.readingMinutes} min read
											<ArrowRightIcon
												aria-hidden
												className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5"
											/>
										</span>
									</LinkCard>
								</li>
							))}
						</ul>
					</>
				)}

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
