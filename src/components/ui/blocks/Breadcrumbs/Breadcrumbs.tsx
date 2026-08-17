"use client";

import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Fragment, useState } from "react";

import { SITE_URL } from "@/lib/config/site";
import { cn } from "@/lib/utils";

export type BreadcrumbItemType = { label: string; href?: Route };

/** Breadcrumb trail with matching BreadcrumbList JSON-LD; the last item is the current page. On small screens the middle levels collapse behind a "…" that expands them. */
export function Breadcrumbs({ items }: { items: BreadcrumbItemType[] }) {
	const [expanded, setExpanded] = useState(false);

	const lastIndex = items.length - 1;
	// Collapse only when there is at least one level between the first and last.
	const hasCollapse = items.length > 2;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.label,
			...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
		})),
	};

	return (
		<nav aria-label="Breadcrumb" className="mb-6 text-sm">
			<ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
				{items.map((item, i) => {
					const last = i === lastIndex;
					const isMiddle = i > 0 && i < lastIndex;
					return (
						<Fragment key={item.label}>
							{hasCollapse && i === 1 && (
								<li
									className={cn(
										"flex items-center gap-1.5 sm:hidden",
										expanded && "hidden",
									)}
								>
									<ChevronRightIcon
										aria-hidden
										className="h-3.5 w-3.5 shrink-0"
									/>
									<button
										type="button"
										onClick={() => setExpanded(true)}
										aria-expanded={expanded}
										aria-label="Show hidden breadcrumb levels"
										className="flex items-center rounded px-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
									>
										<MoreHorizontalIcon aria-hidden className="h-4 w-4" />
									</button>
								</li>
							)}
							<li
								className={cn(
									"flex items-center gap-1.5",
									isMiddle && !expanded && "max-sm:hidden",
								)}
							>
								{i > 0 && (
									<ChevronRightIcon
										aria-hidden
										className="h-3.5 w-3.5 shrink-0"
									/>
								)}
								{item.href && !last ? (
									<Link
										href={item.href}
										className="hover:text-foreground hover:underline"
									>
										{item.label}
									</Link>
								) : (
									<span
										aria-current={last ? "page" : undefined}
										className={last ? "font-medium text-foreground" : undefined}
									>
										{item.label}
									</span>
								)}
							</li>
						</Fragment>
					);
				})}
			</ol>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
				}}
			/>
		</nav>
	);
}
