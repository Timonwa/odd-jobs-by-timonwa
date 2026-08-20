import { TagsIcon } from "lucide-react";

import { SupportBlock } from "@/components/_shared/content";
import { CategoryGrid } from "@/components/_shared/category";
import { PageMain, Breadcrumbs, PageHero } from "@/components/ui";
import { getIndexedSeo, splitHeading } from "@/lib/config/page-seo";
import { ROUTES } from "@/lib/config/routes";

const SEO = getIndexedSeo("categories");
const HEADING = splitHeading(SEO.heading);

export function CategoriesPageContent() {
	return (
		<>
			<PageMain>
				<Breadcrumbs
					items={[
						{ label: "Home", href: ROUTES.home },
						{ label: "Categories" },
					]}
				/>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: TagsIcon, label: SEO.eyebrow }}
					title={
						<>
							{HEADING.lead}
							<span className="hero-gradient-text">{HEADING.accent}</span>
							{HEADING.trail}
						</>
					}
					subtitle={SEO.subtitle}
				/>
				<h2 className="sr-only">All categories</h2>
				<CategoryGrid />
				<SupportBlock className="mt-16" />
			</PageMain>
		</>
	);
}
