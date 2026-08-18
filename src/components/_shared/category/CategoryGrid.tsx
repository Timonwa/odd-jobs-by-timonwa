import { TOOL_CATEGORIES } from "@/lib/config/categories";

import { CategoryCard } from "./CategoryCard";

/** Every category as a card. Shared by the home section and the /categories page. */
export function CategoryGrid() {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{TOOL_CATEGORIES.map((category) => (
				<li key={category.id}>
					<CategoryCard category={category} />
				</li>
			))}
		</ul>
	);
}
