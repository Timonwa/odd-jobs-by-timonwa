import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The id the skip link targets. One constant so the link and the landmark can't drift apart. */
export const MAIN_CONTENT_ID = "main-content";

/** The shared page-content container — owns max-width and padding so every page (tools, blog, categories) aligns; pass `className` to override for narrower layouts. */
export function PageMain({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<main
			id={MAIN_CONTENT_ID}
			// Focusable so the skip link moves focus rather than only scrolling;
			// -1 keeps it out of the normal tab order.
			tabIndex={-1}
			className={cn(
				"container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl",
				className,
			)}
		>
			{children}
		</main>
	);
}
