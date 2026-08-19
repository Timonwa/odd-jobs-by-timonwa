"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_PILLARS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Desktop section nav for the hub, for the navbar's centre slot. Hidden below `lg`, where the `NavActions` menu carries the same links. */
export function HubNav() {
	const pathname = usePathname();

	return (
		<nav aria-label="Sections" className="hidden lg:block">
			<ul className="flex items-center gap-1">
				{NAV_PILLARS.map((pillar) => {
					// Matches everything under the section too, so a post keeps "Blog" lit.
					const isCurrent =
						pathname === pillar.href ||
						(pathname?.startsWith(`${pillar.href}/`) ?? false);
					return (
						<li key={pillar.label}>
							<Link
								href={pillar.href}
								aria-current={isCurrent ? "page" : undefined}
								className={cn(
									"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
									isCurrent
										? "bg-primary/10 text-primary"
										: "text-muted-foreground hover:bg-accent hover:text-foreground",
								)}
							>
								{pillar.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
