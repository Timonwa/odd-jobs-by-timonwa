import type * as React from "react";

import { cn } from "@/lib/utils";

type Variant =
	"default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type Size = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

type ButtonProps = React.ComponentProps<"button"> & {
	variant?: Variant;
	size?: Size;
};

const VARIANT_CLASSES: Record<Variant, string> = {
	default: "bg-primary text-primary-foreground hover:bg-primary/90",
	destructive: "bg-destructive text-white hover:bg-destructive/90",
	outline:
		"border border-border bg-background hover:bg-accent hover:text-accent-foreground",
	secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
	ghost: "hover:bg-accent hover:text-accent-foreground",
	link: "text-primary underline-offset-4 hover:underline",
};

const SIZE_CLASSES: Record<Size, string> = {
	default: "h-9 px-4 py-2",
	sm: "h-8 px-3 text-sm",
	lg: "h-10 px-6",
	icon: "h-9 w-9",
	"icon-sm": "h-8 w-8",
	"icon-lg": "h-10 w-10",
};

const BASE =
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:h-4 [&_svg:not([class*='size-'])]:w-4";

/** Build the button className for a non-button element (e.g. a link styled as a button). */
export function buttonClasses({
	variant = "default",
	size = "default",
	className,
}: {
	variant?: Variant;
	size?: Size;
	className?: string;
} = {}) {
	return cn(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className);
}

/** The app's button. Use `buttonClasses` to apply the same styling to a link or other element. */
export function Button({
	className,
	variant = "default",
	size = "default",
	type = "button",
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={buttonClasses({ variant, size, className })}
			{...props}
		/>
	);
}
