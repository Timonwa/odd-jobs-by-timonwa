import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatCardProps = {
	label: ReactNode;
	value: ReactNode;
	highlight?: boolean;
	className?: string;
};

/** A compact metric tile — large value over a muted label. Renders `<dt>`/`<dd>`, so place it inside a `<dl>`. */
export function StatCard({
	label,
	value,
	highlight = false,
	className,
}: StatCardProps) {
	return (
		<div
			className={cn(
				"flex flex-col-reverse items-start justify-end gap-1 rounded-lg border px-4 py-3",
				highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card",
				className,
			)}
		>
			<dt className="text-muted-foreground text-xs">{label}</dt>
			<dd
				className={cn(
					"text-2xl leading-none font-bold tabular-nums",
					highlight && "text-primary",
				)}
			>
				{value}
			</dd>
		</div>
	);
}
