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

		const FOCUSABLE =
			'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

		const focusableInPanel = (): HTMLElement[] =>
			Array.from(
				panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
			).filter((el) => el.offsetParent !== null || el === panelRef.current);

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				onOpenChange(false);
				return;
			}
			// Trap Tab. Without this the drawer claims `aria-modal="true"` while
			// focus walks out into the page behind it — which assistive tech is
			// being told to ignore, so the user lands somewhere they can't perceive.
			if (e.key !== "Tab") return;
			const focusable = focusableInPanel();
			if (focusable.length === 0) {
				e.preventDefault();
				panelRef.current?.focus();
				return;
			}
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement;
			if (
				!e.shiftKey &&
				(active === last || !panelRef.current?.contains(active))
			) {
				e.preventDefault();
				first?.focus();
			} else if (
				e.shiftKey &&
				(active === first || !panelRef.current?.contains(active))
			) {
				e.preventDefault();
				last?.focus();
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
			// Only restore focus to a trigger that is still visible: opening a drawer
			// from the nav menu closes that menu, so the original trigger can be
			// `display:none` by now, and focusing it would silently drop focus to
			// <body> (F2). Fall back to the document body's first heading region.
			const trigger = previouslyFocused.current;
			if (trigger?.isConnected && trigger.offsetParent !== null)
				trigger.focus();
			else document.querySelector<HTMLElement>("main")?.focus();
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
			{/* Click-outside-to-close, kept out of the tab order: as a focusable
			    button it was a second "Close drawer" stop inside the dialog, on top
			    of Escape and the visible close button. Not a keyboard path anyone
			    needs, so the div carries the click and nothing else. */}
			<div
				aria-hidden
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
