import type * as React from "react";

import { type Tint, TINT_SURFACE } from "@/lib/config/tints";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "primary" | "outline" | "soon";
type BadgeSize = "sm" | "md";

type BadgeProps = React.ComponentProps<"span"> & {
	variant?: BadgeVariant;
	size?: BadgeSize;
	tint?: Tint;
};

const BASE =
	"inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
	default: "border-border bg-muted text-muted-foreground",
	primary: "border-primary/20 bg-primary/10 text-primary",
	outline: "border-border text-muted-foreground",
	soon: "border-border text-muted-foreground uppercase tracking-wide",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
	sm: "px-2 py-0.5 text-[11px]",
	md: "px-3 py-1 text-sm",
};

/** A small pill — category tags, status markers, "Soon" flags, hashtags; `rounded-full` with one padding scale. */
export function Badge({
	className,
	variant = "default",
	size = "sm",
	tint,
	...props
}: BadgeProps) {
	return (
		<span
			className={cn(
				BASE,
				SIZE_CLASSES[size],
				tint ? TINT_SURFACE[tint] : VARIANT_CLASSES[variant],
				className,
			)}
			{...props}
		/>
	);
}
