"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_PILLARS, type NavLinkLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Desktop section nav for the hub, for the navbar's centre slot. Hidden below `lg`, where the `NavActions` menu carries the same links. */
export function HubNav({ section }: { section?: NavLinkLabel }) {
	const pathname = usePathname();

	return (
		<nav aria-label="Sections" className="hidden lg:block">
			<ul className="flex items-center gap-1">
				{NAV_PILLARS.map((pillar) => {
					// Tools sit at root URLs (/word-counter), so a path check can't place
					// them under their section — those pages name it instead.
					const isCurrent = section
						? section === pillar.label
						: pathname === pillar.href ||
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
