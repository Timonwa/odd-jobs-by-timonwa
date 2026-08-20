import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { SupportBlock } from "@/components/_shared/content";
import { ToolGrid } from "@/components/_shared/tool";
import {
	PageMain,
	Breadcrumbs,
	buttonClasses,
	EmptyState,
	PageHero,
} from "@/components/ui";
import type { Category } from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { getToolsInCategory } from "@/lib/config/tools";

/** A single category's page: its tools, with a link back to the full directory. */
export function CategoryDetail({ category }: { category: Category }) {
	const tools = getToolsInCategory(category.id);

	return (
		<>
			<PageMain>
				<Breadcrumbs
					items={[
						{ label: "Home", href: ROUTES.home },
						{ label: "Categories", href: ROUTES.categories },
						{ label: category.label },
					]}
				/>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: category.icon, label: `${category.label} tools` }}
					title={
						<>
							{category.label} <span className="hero-gradient-text">tools</span>
						</>
					}
					subtitle={category.description}
				/>

				{tools.length > 0 ? (
					<ToolGrid tools={tools} />
				) : (
					<EmptyState>
						No {category.label.toLowerCase()} tools yet — they&apos;re on the
						way. Get notified below.
					</EmptyState>
				)}

				<div className="mt-8">
					<Link
						href={ROUTES.tools}
						className={buttonClasses({ variant: "outline" })}
					>
						Browse all tools
						<ArrowRightIcon aria-hidden className="h-4 w-4" />
					</Link>
				</div>

				<SupportBlock className="mt-16" />
			</PageMain>
		</>
	);
}
