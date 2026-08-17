import { MailIcon } from "lucide-react";

import { PageHero } from "@/components/ui";
import { splitTitle } from "@/lib/utils";
import type { IssueMetaType } from "@/lib/schemas";

export function IssueHero({ issue }: { issue: IssueMetaType }) {
	const { lead, accent } = splitTitle(issue);
	return (
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
	);
}
