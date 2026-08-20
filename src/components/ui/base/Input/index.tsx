import type * as React from "react";

import { cn } from "@/lib/utils";

/** The shared text input. */
export function Input({
	className,
	type = "text",
	...props
}: React.ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"flex h-9 w-full rounded-md border-[0.5px] border-input-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground outline-none transition-colors focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
