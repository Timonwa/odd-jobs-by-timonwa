import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/ui";
import type { BreadcrumbItem } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";

const SECTIONS = {
	blog: { label: "Blog", href: ROUTES.blog },
	newsletter: { label: "Newsletter", href: ROUTES.newsletter },
	shop: { label: "Shop", href: ROUTES.shop },
} as const;

export type ContentSection = keyof typeof SECTIONS;

/** Breadcrumb trail for the content sections (Home › Blog › post) — pass `title` on an entry page and omit it on the section index, where the section itself is the current page. `action` sits on the opposite edge of the same row, as the share control does on tool pages. */
export function ContentBreadcrumbs({
	section,
	title,
	action,
}: {
	section: ContentSection;
	title?: string;
	action?: ReactNode;
}) {
	const { label, href } = SECTIONS[section];

	const items: BreadcrumbItem[] = [
		{ label: "Home", href: ROUTES.home },
		// The section is a link only when it isn't the current page — the last
		// crumb renders as plain text and is excluded from the JSON-LD `item`.
		title ? { label, href } : { label },
		...(title ? [{ label: title }] : []),
	];

	if (!action) return <Breadcrumbs items={items} />;

	return (
		<div className="mb-6 flex items-center justify-between gap-3 [&>nav]:mb-0">
			<Breadcrumbs items={items} />
			{action}
		</div>
	);
}
