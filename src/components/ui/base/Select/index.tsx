import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

/** A styled native select with a chevron affordance. */
export function Select({
	className,
	children,
	...props
}: React.ComponentProps<"select">) {
	return (
		<div className="relative">
			<select
				className={cn(
					"h-9 w-full appearance-none rounded-md border border-input-border bg-background pl-3 pr-8 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			>
				{children}
			</select>
			<ChevronDownIcon
				aria-hidden
				className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
			/>
		</div>
	);
}
