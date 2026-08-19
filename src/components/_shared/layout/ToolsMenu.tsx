"use client";

import {
	CheckIcon,
	ChevronDownIcon,
	LayoutGridIcon,
	SearchIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";

import { Button, Input } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { TOOLS } from "@/lib/config/tools";
import { cn } from "@/lib/utils";

type ToolsMenuProps = {
	open: boolean;
	onToggle: () => void;
	onNavigate: () => void;
};

/** The tools switcher dropdown — search box, scrollable tool list, and an "all tools" footer link; width-clamped so it never clips on small screens. */
export function ToolsMenu({ open, onToggle, onNavigate }: ToolsMenuProps) {
	const [query, setQuery] = useState("");
	const menuId = useId();
	const pathname = usePathname();

	const q = query.trim().toLowerCase();
	const tools = q
		? TOOLS.filter(
				(t) =>
					t.name.toLowerCase().includes(q) ||
					t.tagline.toLowerCase().includes(q),
			)
		: TOOLS;

	return (
		<div className="contents">
			<Button
				variant="ghost"
				size="sm"
				// The label span below is responsive, so the name lives here.
				aria-label="Tools"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={menuId}
				onClick={onToggle}
			>
				<LayoutGridIcon aria-hidden className="w-4 h-4" />
				{/* Hidden from `lg` up, where HubNav renders its own Tools link. */}
				<span className="hidden sm:inline lg:hidden">Tools</span>
				<ChevronDownIcon
					aria-hidden
					className={cn(
						"w-3.5 h-3.5 transition-transform",
						open && "rotate-180",
					)}
				/>
			</Button>

			<div
				id={menuId}
				className={cn(
					"absolute right-4 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-popover shadow-lg sm:right-6 lg:right-10",
					open ? "block" : "hidden",
				)}
			>
				<div className="p-2">
					<div className="relative">
						<SearchIcon
							aria-hidden
							className="pointer-events-none absolute left-2.5 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search tools…"
							aria-label="Search tools"
							className="pl-8"
						/>
					</div>
				</div>

				<div className="max-h-[min(50vh,20rem)] overflow-y-auto no-scrollbar px-2 pb-2">
					{tools.length > 0 ? (
						<ul className="flex flex-col gap-1">
							{tools.map((t) => {
								const Icon = t.icon;
								const isCurrent = pathname?.startsWith(t.href) ?? false;
								const isSoon = t.status === "soon";
								return (
									<li key={t.slug}>
										<Link
											href={t.href}
											title={t.name}
											aria-current={isCurrent ? "page" : undefined}
											aria-disabled={isSoon || undefined}
											tabIndex={isSoon ? -1 : undefined}
											onClick={(e) => {
												if (isSoon) {
													e.preventDefault();
													return;
												}
												onNavigate();
											}}
											className={cn(
												"flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors",
												isSoon
													? "cursor-not-allowed opacity-60"
													: "hover:bg-accent",
												isCurrent && "bg-primary/5",
											)}
										>
											<span className="flex w-4 shrink-0 items-center justify-center">
												{isCurrent ? (
													<CheckIcon
														aria-hidden
														className="w-4 h-4 text-primary"
													/>
												) : (
													<Icon
														aria-hidden
														className="w-4 h-4 text-muted-foreground"
													/>
												)}
											</span>
											<span
												className={cn(
													"truncate font-medium",
													isCurrent && "text-primary",
												)}
											>
												{t.name}
											</span>
											{isSoon && (
												<span className="ml-auto shrink-0 rounded-sm border border-border px-1 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
													Soon
												</span>
											)}
										</Link>
									</li>
								);
							})}
						</ul>
					) : (
						<p className="px-1 py-6 text-center text-sm text-muted-foreground">
							No tools match “{query.trim()}”.
						</p>
					)}
				</div>

				<Link
					href={ROUTES.tools}
					onClick={onNavigate}
					className="flex items-center justify-center gap-1 border-t border-border/60 px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					View all tools →
				</Link>
			</div>
		</div>
	);
}
