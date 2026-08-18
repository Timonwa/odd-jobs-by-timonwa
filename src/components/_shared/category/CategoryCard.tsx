import { ArrowRightIcon } from "lucide-react";

import { IconBadge, LinkCard } from "@/components/ui";
import type { Category } from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { LIVE_TOOLS } from "@/lib/config/tools";

/** A category tile linking into the filtered /tools; empty categories show "Coming soon". */
export function CategoryCard({ category }: { category: Category }) {
	const Icon = category.icon;
	const count = LIVE_TOOLS.filter((t) =>
		t.categories.includes(category.id),
	).length;
	const soon = count === 0;

	return (
		<LinkCard
			href={soon ? ROUTES.categories : ROUTES.category(category.id)}
			disabled={soon}
			className={soon ? undefined : category.color.border}
		>
			<IconBadge icon={Icon} tint={category.tint} className="mb-4" />
			<h3 className="mb-1 text-lg font-semibold leading-tight">
				{category.label}
			</h3>
			<p className="mb-4 flex-1 text-sm leading-snug text-muted-foreground">
				{category.description}
			</p>
			<span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
				{soon ? (
					"Coming soon"
				) : (
					<>
						{count} {count === 1 ? "tool" : "tools"}
						<ArrowRightIcon
							aria-hidden
							className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
						/>
					</>
				)}
			</span>
		</LinkCard>
	);
}
