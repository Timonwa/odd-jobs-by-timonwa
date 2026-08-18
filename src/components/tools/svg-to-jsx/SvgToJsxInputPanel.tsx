"use client";

import { useRef } from "react";

import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CodeEditor,
} from "@/components/ui";
import {
	formatSvgMarkup,
	readSvgRootAttr,
	writeSvgRootAttr,
	type IndentUnit,
} from "@/lib/utils";

import { SvgToJsxSizeInput } from "./SvgToJsxSizeInput";

/** Left pane: upload/prettify/clear, the width and height fields, and the markup editor. */
export function SvgToJsxInputPanel({
	svg,
	onSvgChange,
	indent,
	hasSvg,
}: {
	svg: string;
	onSvgChange: (svg: string) => void;
	indent: IndentUnit;
	hasSvg: boolean;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		// Reset first so re-picking the same file still fires a change event.
		event.target.value = "";
		if (!file) return;
		onSvgChange(formatSvgMarkup(await file.text(), indent));
	}

	return (
		<Card className="min-w-0">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2">
					<span className="text-sm font-bold">SVG</span>
					<div className="flex gap-1">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => fileInputRef.current?.click()}
						>
							Upload
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onSvgChange(formatSvgMarkup(svg, indent))}
							disabled={!hasSvg}
						>
							Prettify
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => onSvgChange("")}
							disabled={svg === ""}
						>
							Clear
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-3">
				<input
					ref={fileInputRef}
					type="file"
					accept=".svg,image/svg+xml"
					tabIndex={-1}
					className="hidden"
					onChange={handleUpload}
				/>

				<div className="grid grid-cols-2 gap-3">
					<SvgToJsxSizeInput
						label="Width"
						value={readSvgRootAttr(svg, "width")}
						onChange={(v) => onSvgChange(writeSvgRootAttr(svg, "width", v))}
					/>
					<SvgToJsxSizeInput
						label="Height"
						value={readSvgRootAttr(svg, "height")}
						onChange={(v) => onSvgChange(writeSvgRootAttr(svg, "height", v))}
					/>
				</div>

				<CodeEditor
					value={svg}
					onValueChange={onSvgChange}
					textareaId="svg-input"
					placeholder="Paste your <svg>…</svg> markup here"
				/>
			</CardContent>
		</Card>
	);
}
