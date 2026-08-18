import { MailIcon } from "lucide-react";

import { ContentByline } from "@/components/_shared/content";
import { PageHero } from "@/components/ui";
import { splitTitle } from "@/lib/utils";
import type { IssueMeta } from "@/lib/schemas";

export function IssueHero({ issue }: { issue: IssueMeta }) {
	const { lead, accent } = splitTitle(issue);
	return (
		// The margin moves to the wrapper so the byline sits directly under the
		// title rather than below the hero's spacing.
		<div className="mb-10">
			<PageHero
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
			<ContentByline
				publishedAt={issue.publishedAt}
				updatedAt={issue.updatedAt}
				readingMinutes={issue.readingMinutes}
			/>
		</div>
	);
}
