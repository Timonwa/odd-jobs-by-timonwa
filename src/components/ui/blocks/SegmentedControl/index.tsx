import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SegmentedOption<T> = { value: T; label: ReactNode };

type SegmentedControlProps<T extends string | number> = {
	value: T;
	onChange: (value: T) => void;
	// `readonly` so callers can pass an `as const` option list — the array is only
	// mapped over, never mutated.
	options: readonly SegmentedOption<T>[];
	disabled?: boolean;
	ariaLabel?: string;
	className?: string;
};

/** A joined segmented control (tab switcher): a bordered row where the active button is filled. Controlled. */
export function SegmentedControl<T extends string | number>({
	value,
	onChange,
	options,
	disabled,
	ariaLabel,
	className,
}: SegmentedControlProps<T>) {
	return (
		<div
			role="group"
			aria-label={ariaLabel}
			className={cn(
				"inline-flex min-w-0 max-w-full flex-wrap self-start overflow-hidden rounded-md border border-border",
				className,
			)}
		>
			{options.map((option) => {
				const active = option.value === value;
				return (
					<button
						key={String(option.value)}
						type="button"
						disabled={disabled}
						aria-pressed={active}
						onClick={() => onChange(option.value)}
						className={cn(
							"-m-px flex grow items-center justify-center border border-border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
							active
								? "bg-primary/10 text-primary"
								: "bg-background hover:bg-accent",
						)}
					>
						{option.label}
					</button>
				);
			})}
		</div>
	);
}
