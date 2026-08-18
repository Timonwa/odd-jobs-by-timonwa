import { splitTitle } from "@/lib/utils";
import { getPost, getPostSlugs } from "@/lib/server";
import { SITE_NAME } from "@/lib/config/site";
import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

// Deliberately NOT `runtime = "edge"`: this route loads MDX through
// createMdxLoader, which uses node:fs and is unavailable on the edge.
export const alt = `Blog post — ${SITE_NAME}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
	return getPostSlugs().map((slug) => ({ slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) return new Response("Not found", { status: 404 });

	const { lead, accent } = splitTitle(post);
	return renderOgImage({
		eyebrow: `${post.eyebrow} · ${SITE_NAME}`,
		titleLead: lead.trim(),
		titleAccent: accent,
		subtitle: post.ogSubtitle,
		pills: post.ogPills,
		accent: post.ogAccent,
		backgroundTint: post.ogBackgroundTint,
	});
}
