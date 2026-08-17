import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const CARD_BASE =
	"group relative flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all";
const CARD_INTERACTIVE =
	"hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5";

type LinkCardProps = {
	href: Route;
	disabled?: boolean;
	className?: string;
	children: ReactNode;
};

/** Shared card wrapper for tool and guide tiles — one border, shadow, hover-lift; adds `group` for child hover effects. */
export function LinkCard({
	href,
	disabled,
	className,
	children,
}: LinkCardProps) {
	if (disabled) {
		return (
			<div
				aria-disabled
				className={cn(CARD_BASE, "cursor-not-allowed opacity-60", className)}
			>
				{children}
			</div>
		);
	}
	return (
		<Link href={href} className={cn(CARD_BASE, CARD_INTERACTIVE, className)}>
			{children}
		</Link>
	);
}
