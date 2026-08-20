import type { Route } from "next";
import { ArrowRightIcon } from "lucide-react";

import { LinkCard } from "@/components/ui";

import { RelatedSection } from "./RelatedSection";

export type RelatedItem = {
	href: Route;
	eyebrow: string;
	title: string;
	metaRight?: string;
};

/** A "more like this" grid shown at the foot of a blog post or shop product. */
export function RelatedGrid({
	id,
	heading,
	items,
}: {
	id: string;
	heading: string;
	items: RelatedItem[];
}) {
	if (items.length === 0) return null;

	return (
		<RelatedSection
			id={id}
			heading={heading}
			className="mt-16 border-t border-border/60 pt-10"
		>
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((item) => (
					<li key={item.href}>
						<LinkCard href={item.href}>
							<span className="flex items-center justify-between gap-2">
								<span className="text-xs font-medium uppercase tracking-wide text-primary">
									{item.eyebrow}
								</span>
								{item.metaRight && (
									<span className="text-xs font-semibold text-foreground">
										{item.metaRight}
									</span>
								)}
							</span>
							<h3 className="mt-2 text-base font-semibold leading-snug tracking-tight">
								{item.title}
							</h3>
							<span className="mt-4 flex items-center gap-1.5 text-sm text-primary">
								View
								<ArrowRightIcon
									aria-hidden
									className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5"
								/>
							</span>
						</LinkCard>
					</li>
				))}
			</ul>
		</RelatedSection>
	);
}
