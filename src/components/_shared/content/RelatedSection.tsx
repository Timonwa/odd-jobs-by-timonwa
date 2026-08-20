import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Labelled wrapper for a "more like this" block. Owns the landmark, the heading,
 * and the `aria-labelledby` wiring; the caller passes whatever grid or list fits
 * its content type, and its own outer spacing.
 *
 * `variant` picks the context: `section` for a full-width block below an article,
 * `aside` for a sidebar column beside one.
 */
export function RelatedSection({
	id,
	heading,
	variant = "section",
	className,
	children,
}: {
	/** Unique on the page — the heading id is derived from it. */
	id: string;
	heading: string;
	variant?: "section" | "aside";
	className?: string;
	children: ReactNode;
}) {
	const headingId = `${id}-heading`;
	const Tag = variant === "aside" ? "aside" : "section";

	return (
		<Tag
			aria-labelledby={headingId}
			className={cn(
				"flex flex-col",
				variant === "aside" ? "gap-3" : "gap-4",
				className,
			)}
		>
			<h2
				id={headingId}
				className={
					variant === "aside"
						? "text-sm font-semibold uppercase tracking-wide text-muted-foreground"
						: "text-xl font-semibold tracking-tight"
				}
			>
				{heading}
			</h2>
			{children}
		</Tag>
	);
}
