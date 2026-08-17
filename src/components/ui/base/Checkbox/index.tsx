import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
	label: ReactNode;
};

/** A labeled checkbox — the box and its text as one clickable control. */
export function Checkbox({ label, className, ...props }: CheckboxProps) {
	return (
		<label className="flex w-fit cursor-pointer items-center gap-2 text-sm select-none">
			<input
				type="checkbox"
				className={cn(
					"h-4 w-4 rounded border-border accent-primary",
					className,
				)}
				{...props}
			/>
			{label}
		</label>
	);
}
