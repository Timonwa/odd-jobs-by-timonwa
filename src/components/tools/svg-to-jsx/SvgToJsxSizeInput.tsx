"use client";

import { Input } from "@/components/ui";

/** Numeric-entry field for a single SVG root attribute (width or height). */
export function SvgToJsxSizeInput({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	const id = `svg-${label.toLowerCase()}`;
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id} className="text-sm font-medium">
				{label}
			</label>
			<Input
				id={id}
				type="text"
				inputMode="numeric"
				value={value}
				onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
			/>
		</div>
	);
}
