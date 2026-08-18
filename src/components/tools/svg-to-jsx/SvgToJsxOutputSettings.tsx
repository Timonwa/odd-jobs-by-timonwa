"use client";

import { SettingsIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button, Select } from "@/components/ui";
import {
	SVG_TO_JSX_INDENTS,
	SVG_TO_JSX_QUOTES,
	type SvgQuoteStyle,
} from "@/lib/constants";
import type { IndentUnit } from "@/lib/utils";

/** The "more options" popover on the JSX tab — indent and quote style, which most runs never touch. */
export function SvgToJsxOutputSettings({
	indent,
	onIndentChange,
	quotes,
	onQuotesChange,
}: {
	indent: IndentUnit;
	onIndentChange: (indent: IndentUnit) => void;
	quotes: SvgQuoteStyle;
	onQuotesChange: (quotes: SvgQuoteStyle) => void;
}) {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	return (
		<div ref={containerRef} className="relative">
			<Button
				type="button"
				variant="outline"
				size="icon-sm"
				aria-label="More options"
				aria-haspopup="menu"
				aria-expanded={open}
				onClick={() => setOpen((prev) => !prev)}
			>
				<SettingsIcon aria-hidden className="h-4 w-4" />
			</Button>
			{open && (
				<div className="absolute right-0 top-full z-20 mt-2 flex w-56 flex-col gap-3 rounded-xl border border-border bg-popover p-3 shadow-lg">
					<div className="flex flex-col gap-2">
						<label htmlFor="indent" className="text-sm font-medium">
							Indent
						</label>
						<Select
							id="indent"
							value={indent}
							onChange={(e) => onIndentChange(e.target.value as IndentUnit)}
						>
							{SVG_TO_JSX_INDENTS.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</Select>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="quotes" className="text-sm font-medium">
							Quotes
						</label>
						<Select
							id="quotes"
							value={quotes}
							onChange={(e) => onQuotesChange(e.target.value as SvgQuoteStyle)}
						>
							{SVG_TO_JSX_QUOTES.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</Select>
					</div>
				</div>
			)}
		</div>
	);
}
