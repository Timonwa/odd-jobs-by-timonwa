import { ShareBar } from "./ShareBar";
import { Breadcrumbs } from "@/components/ui";
import type { BreadcrumbItem } from "@/components/ui";
import { getCategory } from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { getPrimaryCategoryId, getToolBySlug } from "@/lib/config/tools";

/** Tool breadcrumb (Home › Tools › category › tool) with the share control on the opposite edge of the same row; the category deep-links the filtered /tools. */
export function ToolBreadcrumbs({
	slug,
	name,
}: {
	slug: string;
	name: string;
}) {
	const tool = getToolBySlug(slug);
	const category = tool ? getCategory(getPrimaryCategoryId(tool)) : undefined;

	const items: BreadcrumbItem[] = [
		{ label: "Home", href: ROUTES.home },
		{ label: "Tools", href: ROUTES.tools },
		// `/categories/<id>`, not `/tools?category=<id>`: the filtered tools URL
		// canonicalizes to `/tools`, so linking it sent crawlers (and the
		// BreadcrumbList) at a non-canonical address.
		...(category
			? [{ label: category.label, href: ROUTES.category(category.id) }]
			: []),
		{ label: name },
	];

	return (
		<div className="mb-6 flex items-center justify-between gap-3 [&>nav]:mb-0">
			<Breadcrumbs items={items} />
			<ShareBar slug={slug} name={name} />
		</div>
	);
}
