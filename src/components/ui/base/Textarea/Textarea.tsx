import type * as React from "react";

import { cn } from "@/lib/utils";

/** The shared auto-sizing textarea (grows with content via `field-sizing`). */
export function Textarea({
	className,
	...props
}: React.ComponentProps<"textarea">) {
	return (
		<textarea
			className={cn(
				"flex min-h-16 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none transition-colors focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 field-sizing-content",
				className,
			)}
			{...props}
		/>
	);
}
