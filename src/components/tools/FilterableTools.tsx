"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ToolGrid } from "@/components/_shared/tool/ToolGrid";
import { ToggleButton } from "@/components/ui";
import { type CategoryIdType, TOOL_CATEGORIES } from "@/lib/config/categories";
import { LIVE_TOOLS } from "@/lib/config/tools";
import { cn } from "@/lib/utils";

/** Categories that actually have a live tool — empty ones never show a chip. */
const PRESENT = TOOL_CATEGORIES.filter((c) =>
	LIVE_TOOLS.some((t) => t.categories.includes(c.id)),
);
const VALID = new Set<CategoryIdType>(PRESENT.map((c) => c.id));

const countIn = (category: CategoryIdType) =>
	LIVE_TOOLS.filter((t) => t.categories.includes(category)).length;

/** Category filter pill — tinted when active, muted when not. */
function FilterChip({
	label,
	count,
	active,
	icon,
	activeClass,
	onClick,
}: {
	label: string;
	count: number;
	active: boolean;
	icon?: React.ReactNode;
	activeClass?: string;
	onClick: () => void;
}) {
	return (
		<ToggleButton
			shape="pill"
			active={active}
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				!active && "bg-transparent text-muted-foreground hover:text-foreground",
				// A category tint for the active state overrides the default primary.
				active && activeClass,
			)}
		>
			{icon}
			{label}
			<span className="text-xs opacity-70">{count}</span>
		</ToggleButton>
	);
}

export function FilterableTools() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();

	const raw = params.get("category");
	const active =
		raw && VALID.has(raw as CategoryIdType) ? (raw as CategoryIdType) : null;

	const tools = active
		? LIVE_TOOLS.filter((t) => t.categories.includes(active))
		: LIVE_TOOLS;

	const select = (category: CategoryIdType | null) => {
		const url = category ? `${pathname}?category=${category}` : pathname;
		router.replace(url as Route, { scroll: false });
	};

	return (
		<div className="flex flex-col gap-6">
			<div
				role="group"
				aria-label="Filter tools by category"
				className="flex flex-wrap gap-2"
			>
				<FilterChip
					label="All"
					count={LIVE_TOOLS.length}
					active={active === null}
					onClick={() => select(null)}
				/>
				{PRESENT.map((category) => {
					const Icon = category.icon;
					return (
						<FilterChip
							key={category.id}
							label={category.label}
							count={countIn(category.id)}
							active={active === category.id}
							activeClass={category.color.badge}
							icon={<Icon aria-hidden className="h-3.5 w-3.5" />}
							onClick={() => select(category.id)}
						/>
					);
				})}
			</div>

			<ToolGrid tools={tools} />
		</div>
	);
}
