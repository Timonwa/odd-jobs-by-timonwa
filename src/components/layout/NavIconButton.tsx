import type { ComponentProps } from "react";

import { Button, Tooltip } from "@/components/ui";

type NavIconButtonProps = ComponentProps<typeof Button> & {
	label: string;
	tooltipAlign?: "center" | "start" | "end";
};

/** Navbar icon button with a consistent custom tooltip at every breakpoint — reuse for every icon-only navbar control so tooltips never diverge. `label` is both the tooltip text and the accessible name. */
export function NavIconButton({
	label,
	tooltipAlign = "end",
	variant = "ghost",
	children,
	...props
}: NavIconButtonProps) {
	return (
		<Tooltip label={label} side="bottom" align={tooltipAlign}>
			<Button variant={variant} size="icon-sm" aria-label={label} {...props}>
				{children}
			</Button>
		</Tooltip>
	);
}
