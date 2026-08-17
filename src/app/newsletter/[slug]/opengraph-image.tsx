import { splitTitle } from "@/lib/utils";
import { getIssue, getIssueSlugs } from "@/lib/server";
import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

export const alt = "Newsletter issue — The Productivity Bug";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
	return getIssueSlugs().map((slug) => ({ slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const issue = getIssue(slug);
	if (!issue) return new Response("Not found", { status: 404 });

	const { lead, accent } = splitTitle(issue);
	return renderOgImage({
		eyebrow:
			issue.issueNumber != null
				? `Issue #${issue.issueNumber} · The Productivity Bug`
				: `${issue.eyebrow} · The Productivity Bug`,
		titleLead: lead.trim(),
		titleAccent: accent,
		subtitle: issue.ogSubtitle,
		pills: issue.ogPills,
		accent: issue.ogAccent,
		backgroundTint: issue.ogBackgroundTint,
	});
}
