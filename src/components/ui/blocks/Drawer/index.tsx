"use client";

import { XIcon } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type DrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title?: React.ReactNode;
	description?: React.ReactNode;
	children: React.ReactNode;
	footer?: React.ReactNode;
	className?: string;
};

/** A portaled slide-over drawer (overlay + focus-trapped panel) with title, description, body, and optional footer. */
export function Drawer({
	open,
	onOpenChange,
	title,
	description,
	children,
	footer,
	className,
}: DrawerProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);
	const titleId = useId();
	const descriptionId = useId();

	useEffect(() => {
		if (!open) return;

		previouslyFocused.current = document.activeElement as HTMLElement | null;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onOpenChange(false);
			}
		};
		document.addEventListener("keydown", handleKeyDown);

		const focusTarget =
			panelRef.current?.querySelector<HTMLElement>(
				"[data-autofocus], input, button, textarea, select, [tabindex]:not([tabindex='-1'])",
			) ?? panelRef.current;
		focusTarget?.focus();

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = prevOverflow;
			previouslyFocused.current?.focus?.();
		};
	}, [open, onOpenChange]);

	if (typeof window === "undefined" || !open) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-50"
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? titleId : undefined}
			aria-describedby={description ? descriptionId : undefined}
		>
			<button
				type="button"
				aria-label="Close drawer"
				onClick={() => onOpenChange(false)}
				className="absolute inset-0 bg-black/50 animate-in fade-in-0 cursor-default"
			/>
			<div
				ref={panelRef}
				tabIndex={-1}
				className={cn(
					"absolute inset-y-0 right-0 flex flex-col w-full sm:max-w-md bg-background border-l border-border shadow-xl outline-none animate-in slide-in-from-right duration-300",
					className,
				)}
			>
				{(title || description) && (
					<div className="flex flex-col gap-1.5 p-4 sm:p-5 border-b border-border/50">
						{title && (
							<h2 id={titleId} className="text-foreground font-semibold">
								{title}
							</h2>
						)}
						{description && (
							<p id={descriptionId} className="text-muted-foreground text-sm">
								{description}
							</p>
						)}
					</div>
				)}

				<div className="flex-1 overflow-y-auto no-scrollbar">{children}</div>

				{footer && (
					<div className="border-t border-border/50 p-4 sm:p-5">{footer}</div>
				)}

				<button
					type="button"
					onClick={() => onOpenChange(false)}
					className="absolute top-4 right-4 rounded-sm p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
					aria-label="Close"
				>
					<XIcon className="w-4 h-4" />
				</button>
			</div>
		</div>,
		document.body,
	);
}
