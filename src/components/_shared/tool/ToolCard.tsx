import { ArrowRightIcon } from "lucide-react";

import { Badge, IconBadge, LinkCard } from "@/components/ui";
import { getCategory } from "@/lib/config/categories";
import { getPrimaryCategoryId, type Tool } from "@/lib/config/tools";

import { CategoryBadge } from "@/components/_shared/category";

/** A tool tile — icon, name, tagline, category badges; colored by primary category. "Soon" renders dimmed. */
export function ToolCard({ tool }: { tool: Tool }) {
	const Icon = tool.icon;
	const isSoon = tool.status === "soon";
	const color = getCategory(getPrimaryCategoryId(tool)).color;

	return (
		<LinkCard
			href={tool.href}
			disabled={isSoon}
			className={isSoon ? undefined : color.border}
		>
			<div className="mb-4 flex items-center justify-between">
				<IconBadge icon={Icon} colorClass={color.chip} />
				{isSoon && <Badge variant="soon">Soon</Badge>}
			</div>

			<h3 className="mb-1 text-lg font-semibold leading-tight">{tool.name}</h3>
			<p className="mb-4 flex-1 text-sm leading-snug text-muted-foreground">
				{tool.tagline}
			</p>

			<ul className="mb-4 flex flex-wrap gap-1.5">
				{tool.categories.map((category) => (
					<li key={category}>
						<CategoryBadge category={category} />
					</li>
				))}
			</ul>

			{!isSoon && (
				<span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
					Open tool
					<ArrowRightIcon
						aria-hidden
						className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
					/>
				</span>
			)}
		</LinkCard>
	);
}
