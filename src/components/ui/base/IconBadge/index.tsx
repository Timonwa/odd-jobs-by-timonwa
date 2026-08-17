import type { ComponentType, SVGProps } from "react";

import { type Tint, TINT_ICON } from "@/lib/config/tints";
import { cn } from "@/lib/utils";

type IconBadgeSize = "md" | "lg";

type IconBadgeProps = {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	tint?: Tint;
	colorClass?: string;
	size?: IconBadgeSize;
	className?: string;
};

const SIZE_CLASSES: Record<IconBadgeSize, string> = {
	md: "size-10 rounded-lg",
	lg: "size-11 rounded-xl",
};

/** A rounded, tinted tile holding a single icon; color from a `tint` index or a raw `colorClass`. */
export function IconBadge({
	icon: Icon,
	tint,
	colorClass,
	size = "md",
	className,
}: IconBadgeProps) {
	return (
		<span
			aria-hidden
			className={cn(
				"flex items-center justify-center",
				SIZE_CLASSES[size],
				tint ? TINT_ICON[tint] : colorClass,
				className,
			)}
		>
			<Icon className="size-5" />
		</span>
	);
}
