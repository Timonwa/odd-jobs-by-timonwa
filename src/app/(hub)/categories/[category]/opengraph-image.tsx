import {
	type CategoryId,
	getCategory,
	TOOL_CATEGORIES,
} from "@/lib/config/categories";
import { OG_PALETTES, OG_PALETTE_BY_TINT } from "@/lib/constants";
import {
	OG_CONTENT_TYPE,
	OG_SIZE,
	renderOgImage,
} from "@/lib/server/utils/og-image.utils";
import { siteConfig } from "@/lib/config/site";

// Deliberately NOT `runtime = "edge"`: Next forbids pairing it with
// `generateStaticParams`, which the sibling `[slug]` image routes also use. Like
// every OG route here the output is still `ƒ Dynamic` — image routes don't
// prerender at this Next version — so the params exist to enumerate and
// build-validate the category set, not to make it static. Node costs nothing:
// this reads plain config, no node:fs.
//
// `alt` is a module constant and can't vary per category; `generateImageMetadata`
// is the API for that. Left as the section-level description rather than
// claiming per-item text the export cannot deliver.
export const alt = `Tool category — ${siteConfig.name}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Matches the page's own static params, so an unlisted category can't drift in.
export function generateStaticParams() {
	return TOOL_CATEGORIES.map((category) => ({ category: category.id }));
}

const isCategoryId = (id: string): id is CategoryId =>
	TOOL_CATEGORIES.some((category) => category.id === id);

export default async function Image({
	params,
}: {
	params: Promise<{ category: string }>;
}) {
	const { category: id } = await params;

	// An unknown slug still renders a card rather than throwing: the page itself
	// 404s, but a broken image route would surface as a dead social preview.
	if (!isCategoryId(id)) {
		return renderOgImage({
			eyebrow: `Categories · ${siteConfig.name}`,
			titleLead: "Tool",
			titleAccent: "categories",
			subtitle: "Browse the hub by what you need.",
			pills: ["AI writing", "SEO", "Developer", "Text"],
			...OG_PALETTES.brand,
		});
	}

	const category = getCategory(id);

	return renderOgImage({
		eyebrow: `${category.label} · ${siteConfig.name}`,
		titleLead: category.label,
		titleAccent: "tools",
		subtitle: category.description,
		pills: ["Free", "No sign-up", "Open source"],
		...OG_PALETTE_BY_TINT[category.tint],
	});
}
