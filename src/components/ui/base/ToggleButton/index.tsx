import type * as React from "react";

import { cn } from "@/lib/utils";

type ToggleSize = "sm" | "md";
type ToggleShape = "square" | "pill";

type ToggleButtonProps = React.ComponentProps<"button"> & {
	active?: boolean;
	size?: ToggleSize;
	shape?: ToggleShape;
};

const BASE =
	"inline-flex items-center justify-center gap-1.5 border font-medium whitespace-nowrap transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const SIZE_CLASSES: Record<ToggleSize, string> = {
	sm: "px-3 py-1.5 text-xs",
	md: "px-3 py-1.5 text-sm",
};

const SHAPE_CLASSES: Record<ToggleShape, string> = {
	square: "rounded-md",
	pill: "rounded-full",
};

/** A bordered choice button that fills with the brand accent when `active`; pass your own `aria-pressed`/`aria-selected`. */
export function ToggleButton({
	className,
	active = false,
	size = "md",
	shape = "square",
	type = "button",
	...props
}: ToggleButtonProps) {
	return (
		<button
			type={type}
			className={cn(
				BASE,
				SIZE_CLASSES[size],
				SHAPE_CLASSES[shape],
				active
					? "border-primary bg-primary/10 text-primary"
					: "border-input-border bg-background hover:bg-accent hover:text-accent-foreground",
				className,
			)}
			{...props}
		/>
	);
}
