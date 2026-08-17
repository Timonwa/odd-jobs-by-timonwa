import type * as React from "react";

import { cn } from "@/lib/utils";

/** A bordered, rounded surface card. Compose with CardHeader/CardTitle/CardDescription/CardContent/CardFooter. */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-border py-6 shadow-sm",
				className,
			)}
			{...props}
		/>
	);
}

export function CardHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-2 px-6", className)} {...props} />
	);
}

export function CardTitle({
	className,
	children,
	...props
}: React.ComponentProps<"h3">) {
	return (
		<h3 className={cn("leading-none font-semibold", className)} {...props}>
			{children}
		</h3>
	);
}

export function CardDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p className={cn("text-muted-foreground text-sm", className)} {...props} />
	);
}

export function CardContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return <div className={cn("px-6", className)} {...props} />;
}

export function CardFooter({
	className,
	...props
}: React.ComponentProps<"div">) {
	return <div className={cn("flex items-center px-6", className)} {...props} />;
}
