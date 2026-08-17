import { TagsIcon } from "lucide-react";

import { Newsletter } from "@/components/_shared/content";
import { CategoryGrid } from "@/components/_shared/category";
import { HubNavbar } from "@/components/_shared/layout";
import { PageMain, Breadcrumbs, PageHero } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";

export function CategoriesPageContent() {
	return (
		<>
			<HubNavbar />
			<PageMain>
				<Breadcrumbs
					items={[
						{ label: "Home", href: ROUTES.home },
						{ label: "Categories" },
					]}
				/>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: TagsIcon, label: "Categories" }}
					title={
						<>
							Browse tools by{" "}
							<span className="hero-gradient-text">category</span>
						</>
					}
					subtitle="Every tool belongs to one or more categories — pick a lane to see what's there, and what's on the way."
				/>
				<h2 className="sr-only">All categories</h2>
				<CategoryGrid />
				<Newsletter className="mt-16" />
			</PageMain>
		</>
	);
}
