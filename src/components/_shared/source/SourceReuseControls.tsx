"use client";

import { Trash2Icon } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type SourceReuseControlsProps = {
	id: string;
	reuse: boolean;
	onToggleReuse: (next: boolean) => void;
	onClear: () => void;
	canClear: boolean;
	disabled?: boolean;
	className?: string;
	noun?: string;
	scope?: string;
};

/** The opt-in "reuse across tools" checkbox + Clear button; when reuse is on, Clear wipes the shared value everywhere. */
export function SourceReuseControls({
	id,
	reuse,
	onToggleReuse,
	onClear,
	canClear,
	disabled,
	className,
	noun = "text",
	scope = "your other article tools",
}: SourceReuseControlsProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5",
				className,
			)}
		>
			<label
				htmlFor={id}
				className="flex items-center gap-2 text-sm cursor-pointer select-none"
			>
				<input
					id={id}
					type="checkbox"
					checked={reuse}
					onChange={(e) => onToggleReuse(e.target.checked)}
					disabled={disabled}
					className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
				/>
				<span>Reuse this {noun} across tools</span>
			</label>
			<Button
				type="button"
				variant="ghost"
				size="sm"
				onClick={onClear}
				disabled={disabled || !canClear}
				title={
					reuse
						? `Clears the ${noun} here and in every tool that reuses it`
						: `Clears the ${noun} in this box`
				}
			>
				<Trash2Icon aria-hidden className="w-4 h-4" />
				{reuse ? `Clear shared ${noun}` : "Clear"}
			</Button>
			<p className="w-full text-xs text-muted-foreground">
				{reuse
					? `Shared with ${scope} and saved in your browser. Untick to keep it only here.`
					: `Stays in this tool only. Tick to reuse it across ${scope}.`}
			</p>
		</div>
	);
}
