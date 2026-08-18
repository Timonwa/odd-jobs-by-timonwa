import type { Route } from "next";
import type { ReactNode } from "react";

import { Navbar } from "@/components/ui";
import { NavActions } from "./NavActions";
import type { IconComponent } from "@/lib/types";

type AppNavbarProps = {
	brand: {
		href: Route;
		name: string;
		icon: IconComponent;
		ariaLabel?: string;
	};
	centerSlot?: ReactNode;
	actionsSlot?: ReactNode;
	menuSlot?: ReactNode;
	repoUrl?: string;
	showByok?: boolean;
};

/** The Navbar shell with this app's NavActions cluster slotted in — tools switcher, theme, support, GitHub, and the nav menu. */
export function AppNavbar({
	brand,
	centerSlot,
	actionsSlot,
	menuSlot,
	repoUrl,
	showByok,
}: AppNavbarProps) {
	return (
		<Navbar
			brand={brand}
			centerSlot={centerSlot}
			endSlot={
				<NavActions
					actionsSlot={actionsSlot}
					menuSlot={menuSlot}
					repoUrl={repoUrl}
					showByok={showByok}
				/>
			}
		/>
	);
}
