import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconComponent } from "@/lib/types";

type NavbarProps = {
	brand: {
		href: Route;
		name: string;
		icon: IconComponent;
		ariaLabel?: string;
	};
	centerSlot?: ReactNode;
	endSlot?: ReactNode;
};

/** The primary navbar shell — brand link on the left, optional center slot, and whatever the app slots in on the right. */
export function Navbar({ brand, centerSlot, endSlot }: NavbarProps) {
	const BrandIcon = brand.icon;
	return (
		<nav
			aria-label="Primary"
			className="flex items-center justify-between gap-2 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-md sticky top-0 z-40 sm:px-6 sm:py-4 lg:px-10"
		>
			<Link
				href={brand.href}
				aria-label={brand.ariaLabel ?? brand.name}
				className="flex min-w-0 items-center gap-2 pr-1 text-base font-semibold sm:text-lg"
			>
				<span
					aria-hidden
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
				>
					<BrandIcon className="w-5 h-5" />
				</span>
				<span className="truncate">{brand.name}</span>
			</Link>

			<div className="flex shrink-0 items-center gap-1 sm:gap-2">
				{centerSlot}
				{endSlot}
			</div>
		</nav>
	);
}
