import { getIssue, getIssueSlugs } from "@/lib/server";
import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";
import { OG_PALETTES } from "@/lib/constants";

// Deliberately NOT `runtime = "edge"`: this route loads MDX through
// createMdxLoader, which uses node:fs and is unavailable on the edge.
// `alt` is a module constant, so it can't vary per item; `generateImageMetadata`
// is the API for that. Left as the section-level description rather than
// claiming per-item text the export cannot deliver.
export const alt = `Newsletter issue — ${siteConfig.name}`;
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

	return renderOgImage({
		eyebrow: `${siteConfig.name} Newsletter`,
		titleLead: "Issue",
		titleAccent: `#${issue.issueNumber}`,
		subtitle: issue.description,
		pills: [],
		...OG_PALETTES.brand,
	});
}
