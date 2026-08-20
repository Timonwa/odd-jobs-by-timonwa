import { LinkCard } from "@/components/ui";

import { RelatedSection } from "./RelatedSection";
import type { RelatedItem } from "./RelatedGrid";

/** Sidebar list of sibling content, shown beside an article or product at `lg+`. */
export function RelatedAside({
	heading,
	items,
	id,
}: {
	heading: string;
	items: RelatedItem[];
	id: string;
}) {
	if (items.length === 0) return null;

	return (
		<RelatedSection id={id} heading={heading} variant="aside">
			<ul className="flex flex-col gap-3">
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
							<span className="mt-2 block text-sm font-semibold leading-snug">
								{item.title}
							</span>
						</LinkCard>
					</li>
				))}
			</ul>
		</RelatedSection>
	);
}
