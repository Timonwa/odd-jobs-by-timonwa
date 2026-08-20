import type { ReactNode } from "react";

import Link from "next/link";

import { ROUTES } from "@/lib/config/routes";
import { siteConfig } from "@/lib/config/site";

import { BrandLockup } from "./BrandLockup";
import { NavActions } from "./NavActions";

type AppNavbarProps = {
	centerSlot?: ReactNode;
	actionsSlot?: ReactNode;
	menuSlot?: ReactNode;
	repoUrl?: string;
	showByok?: boolean;
};

/** The app's navbar — one brand lockup on every page (tool routes included, where the breadcrumb carries the tool's own identity), an optional centre slot, and the NavActions cluster. */
export function AppNavbar({
	centerSlot,
	actionsSlot,
	menuSlot,
	repoUrl,
	showByok,
}: AppNavbarProps) {
	return (
		<nav
			aria-label="Primary"
			className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40"
		>
			{/* The bar is full-bleed for its border and blur; this row carries
			    PageMain's width so the two align. `relative` anchors the dropdowns. */}
			<div className="container relative mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
				<Link
					href={ROUTES.home}
					aria-label={`${siteConfig.name} — home`}
					className="flex min-w-0 items-center pr-1"
				>
					<BrandLockup />
				</Link>

				<div className="flex shrink-0 items-center gap-1 sm:gap-2">
					{centerSlot}
					<NavActions
						actionsSlot={actionsSlot}
						menuSlot={menuSlot}
						repoUrl={repoUrl}
						showByok={showByok}
					/>
				</div>
			</div>
		</nav>
	);
}
