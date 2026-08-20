import type * as React from "react";

import { cn } from "@/lib/utils";

/** A dashed, centered placeholder for "nothing here yet" states. */
export function EmptyState({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"text-muted-foreground rounded-xl border border-dashed border-border p-8 text-center",
				className,
			)}
			{...props}
		/>
	);
}
