import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The shared page-content container — owns max-width and padding so every page (tools, guides, categories) aligns; pass `className` to override for narrower layouts. */
export function PageMain({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<main
			className={cn(
				"container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl",
				className,
			)}
		>
			{children}
		</main>
	);
}
