import { Badge } from "@/components/ui";
import { type CategoryId, getCategory } from "@/lib/config/categories";

/** A small, non-interactive category pill (icon + label) shown on tool cards. */
export function CategoryBadge({ category }: { category: CategoryId }) {
	const { label, icon: Icon, tint } = getCategory(category);
	return (
		<Badge tint={tint}>
			<Icon aria-hidden className="size-3" />
			{label}
		</Badge>
	);
}
