import { ArrowRightIcon, ClockIcon } from "lucide-react";

import { LinkCard } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import type { IssueMeta } from "@/lib/issues/issues";

const dateFormat = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
});

export function IssueGrid({ issues }: { issues: IssueMeta[] }) {
	if (issues.length === 0) return null;
	return (
		<>
			<h2 className="mb-4 text-lg font-semibold tracking-tight">Past issues</h2>
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
	);
}
