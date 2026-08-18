// No "use client": this is pure CSS (group-hover/group-focus-within), so it
// renders on the server and costs the client bundle nothing.
import { cn } from "@/lib/utils";

type TooltipProps = {
	label: string;
	children: React.ReactNode;
	side?: "top" | "bottom";
	align?: "center" | "start" | "end";
	className?: string;
	desktopOnly?: boolean;
};

/** CSS-only tooltip revealing `label` on hover/focus; the bubble is `aria-hidden` (the trigger's `aria-label` names it). */
export function Tooltip({
	label,
	children,
	side = "top",
	align = "center",
	className,
	desktopOnly,
}: TooltipProps) {
	return (
		<span className={cn("group/tooltip relative inline-flex", className)}>
			{children}
			<span
				aria-hidden
				className={cn(
					"pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border/60 bg-popover/95 px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md backdrop-blur-md opacity-0 transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
					side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
					align === "center"
						? "left-1/2 -translate-x-1/2"
						: align === "start"
							? "left-0"
							: "right-0",
					desktopOnly && "hidden xl:block",
				)}
			>
				{label}
			</span>
		</span>
	);
}
