import { splitTitle } from "@/lib/utils";
import { getProduct, getProductSlugs } from "@/lib/server";
import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";

// Deliberately NOT `runtime = "edge"`: this route loads MDX through
// createMdxLoader, which uses node:fs and is unavailable on the edge.
export const alt = "Product — The Productivity Bug";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
	return getProductSlugs().map((slug) => ({ slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const product = getProduct(slug);
	if (!product) return new Response("Not found", { status: 404 });

	const { lead, accent } = splitTitle(product);
	return renderOgImage({
		eyebrow: `${product.eyebrow} · The Productivity Bug`,
		titleLead: lead.trim(),
		titleAccent: accent,
		subtitle: product.ogSubtitle,
		pills: product.ogPills,
		accent: product.ogAccent,
		backgroundTint: product.ogBackgroundTint,
	});
}
