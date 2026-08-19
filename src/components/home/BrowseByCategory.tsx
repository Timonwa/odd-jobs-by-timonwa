import { CategoryGrid } from "@/components/_shared/category";
import { Section, SectionHeader } from "@/components/ui";

export function BrowseByCategory() {
	return (
		<Section aria-labelledby="categories-heading" className="gap-6">
			<SectionHeader
				id="categories-heading"
				title="Browse by category"
				subtitle="Jump straight to the kind of tool you need."
			/>
			<CategoryGrid />
		</Section>
	);
}
