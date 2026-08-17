import CategoryGrid from "@/components/_shared/category/CategoryGrid";
import { Section, SectionHeader } from "@/components/ui";

export default function BrowseByCategory() {
	return (
		<Section aria-labelledby="categories-heading" className="gap-6">
			<SectionHeader
				id="categories-heading"
				title="Browse by category"
				subtitle="Jump to the kind of tool you need — writing, code, SEO, media, and more."
			/>
			<CategoryGrid />
		</Section>
	);
}
