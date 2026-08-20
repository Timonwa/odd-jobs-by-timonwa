import { Badge } from "@/components/ui";
import { TOOL_CATEGORIES } from "@/lib/config/categories";
import type { Tint } from "@/lib/config/tints";
import { cn } from "@/lib/utils";

const AUDIENCES: { label: string; tint: Tint }[] = [
	{ label: "Writers", tint: 1 },
	{ label: "Developers", tint: 2 },
	{ label: "Creators", tint: 3 },
];

// Scatter positions for the decorative category-icon cluster (matches the order
// of TOOL_CATEGORIES: writing, ai, seo, developer, media). Center tile largest.
const TILE_POSITIONS = [
	"left-2 top-3 h-16 w-16 -rotate-6",
	"right-6 top-1 h-14 w-14 rotate-6",
	"left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rotate-2",
	"left-8 bottom-2 h-14 w-14 rotate-3",
	"right-2 bottom-6 h-16 w-16 -rotate-3",
];

export function WhatItIs() {
	return (
		<section
			aria-labelledby="about-heading"
			className="relative mt-20 overflow-hidden rounded-2xl border border-border bg-linear-to-br from-primary/10 via-card to-card p-8 sm:mt-24 sm:p-12"
		>
			<div
				aria-hidden
				className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
			/>
			<div className="relative grid gap-10 sm:grid-cols-2 sm:items-center">
				<div>
					<h2
						id="about-heading"
						className="text-3xl font-semibold tracking-tight sm:text-4xl"
					>
						More than a <span className="hero-gradient-text">toolbox</span>
					</h2>
					<p className="mt-4 max-w-md text-muted-foreground">
						The tools each do one annoying job — character counts, clean slugs,
						SVG conversions, an article turned into social posts. The blog and
						newsletter go wider: working with less friction, and actually
						finishing what you start. The shop has the templates I use myself.
						Free to use, no account needed, and the code is open source.
					</p>
					<ul className="mt-6 flex flex-wrap gap-2">
						{AUDIENCES.map((audience) => (
							<li key={audience.label}>
								<Badge tint={audience.tint} size="md">
									{audience.label}
								</Badge>
							</li>
						))}
					</ul>
				</div>

				{/* Decorative cluster of colored category icons — fills the space. */}
				<div aria-hidden className="relative hidden h-56 sm:block lg:h-64">
					{TOOL_CATEGORIES.map((category, i) => {
						const Icon = category.icon;
						return (
							<span
								key={category.id}
								className={cn("absolute", TILE_POSITIONS[i])}
							>
								<span
									className="flex h-full w-full items-center justify-center rounded-2xl border border-border bg-card p-2.5 shadow-md motion-safe:animate-[tool-float_3.5s_ease-in-out_infinite]"
									style={{ animationDelay: `${i * 0.4}s` }}
								>
									<span
										className={cn(
											"flex h-full w-full items-center justify-center rounded-xl",
											category.color.chip,
										)}
									>
										<Icon className="h-5 w-5" />
									</span>
								</span>
							</span>
						);
					})}
				</div>
			</div>
		</section>
	);
}
