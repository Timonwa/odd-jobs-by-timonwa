"use client";

import { DownloadIcon } from "lucide-react";

import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CodeEditor,
	CopyButton,
	Input,
	SegmentedControl,
	Select,
} from "@/components/ui";
import {
	SVG_PREVIEW_FILL,
	SVG_TO_JSX_BACKGROUNDS,
	SVG_TO_JSX_TABS,
	type SvgOutputTab,
	type SvgPreviewBackground,
	type SvgQuoteStyle,
} from "@/lib/constants";
import { cn, svgPreviewBackgroundStyle, type IndentUnit } from "@/lib/utils";

import { SvgToJsxOutputSettings } from "./SvgToJsxOutputSettings";

export type SvgToJsxOutputPanelProps = {
	tab: SvgOutputTab;
	onTabChange: (tab: SvgOutputTab) => void;
	background: SvgPreviewBackground;
	onBackgroundChange: (background: SvgPreviewBackground) => void;
	/** Sanitized markup for the preview pane; "" while the JSX tab is showing. */
	safePreview: string;
	/** What the editor shows: the hand-edited value while it still applies, else `generated`. */
	output: string;
	onOutputEdit: (value: string) => void;
	onDownload: () => void;
	componentName: string;
	onComponentNameChange: (name: string) => void;
	typescript: boolean;
	onTypescriptChange: (typescript: boolean) => void;
	indent: IndentUnit;
	onIndentChange: (indent: IndentUnit) => void;
	quotes: SvgQuoteStyle;
	onQuotesChange: (quotes: SvgQuoteStyle) => void;
	hasSvg: boolean;
	/** Whether there is any input at all — separates "not SVG" from "nothing yet". */
	hasInput: boolean;
};

/** Right pane: the Preview/JSX tab switch, its per-tab controls, and the output itself. */
export function SvgToJsxOutputPanel({
	tab,
	onTabChange,
	background,
	onBackgroundChange,
	safePreview,
	output,
	onOutputEdit,
	onDownload,
	componentName,
	onComponentNameChange,
	typescript,
	onTypescriptChange,
	indent,
	onIndentChange,
	quotes,
	onQuotesChange,
	hasSvg,
	hasInput,
}: SvgToJsxOutputPanelProps) {
	return (
		<Card className="min-w-0">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/80 pb-2">
					<SegmentedControl
						value={tab}
						onChange={onTabChange}
						options={SVG_TO_JSX_TABS}
						ariaLabel="Output view"
					/>
					{tab === "jsx" ? (
						<div className="flex items-center gap-1">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={onDownload}
								disabled={!output}
							>
								<DownloadIcon aria-hidden className="h-4 w-4" />
								Download
							</Button>
							<CopyButton value={output} />
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							{SVG_TO_JSX_BACKGROUNDS.map((bg) => (
								<button
									key={bg.id}
									type="button"
									aria-pressed={background === bg.id}
									aria-label={`${bg.label} background`}
									onClick={() => onBackgroundChange(bg.id)}
									style={svgPreviewBackgroundStyle(bg.id, 8)}
									className={cn(
										"h-6 w-6 cursor-pointer rounded border",
										background === bg.id
											? "border-primary ring-2 ring-primary"
											: "border-border",
									)}
								/>
							))}
						</div>
					)}
				</div>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-3">
				{tab === "preview" ? (
					hasSvg ? (
						<div
							style={svgPreviewBackgroundStyle(background, 16)}
							className={cn(
								"flex items-center justify-center overflow-auto no-scrollbar rounded-lg border border-border p-6 [&>svg]:h-40 [&>svg]:w-auto",
								SVG_PREVIEW_FILL,
								background === "dark" ? "text-neutral-100" : "text-neutral-900",
							)}
							dangerouslySetInnerHTML={{ __html: safePreview }}
						/>
					) : (
						<p
							className={cn(
								"flex items-center justify-center rounded-lg border border-border bg-muted/40 px-3 text-center text-sm text-muted-foreground",
								SVG_PREVIEW_FILL,
							)}
						>
							Your icon appears here.
						</p>
					)
				) : (
					<div className="flex flex-1 flex-col gap-3">
						<div className="flex flex-wrap items-end gap-3">
							<div className="flex flex-1 flex-col gap-2">
								<label htmlFor="component-name" className="text-sm font-medium">
									Component name
								</label>
								<Input
									id="component-name"
									value={componentName}
									onChange={(e) => onComponentNameChange(e.target.value)}
									placeholder="Bare JSX if blank"
								/>
							</div>
							<div className="flex flex-1 flex-col gap-2">
								<label htmlFor="language" className="text-sm font-medium">
									Language
								</label>
								<Select
									id="language"
									value={typescript ? "ts" : "js"}
									onChange={(e) => onTypescriptChange(e.target.value === "ts")}
								>
									<option value="js">JavaScript</option>
									<option value="ts">TypeScript</option>
								</Select>
							</div>
							<SvgToJsxOutputSettings
								indent={indent}
								onIndentChange={onIndentChange}
								quotes={quotes}
								onQuotesChange={onQuotesChange}
							/>
						</div>

						{hasSvg ? (
							<CodeEditor
								value={output}
								onValueChange={onOutputEdit}
								textareaId="jsx-output"
								className="bg-muted/40"
							/>
						) : (
							<p className="flex h-96 items-center justify-center rounded-lg border border-border bg-muted/40 px-3 text-center text-sm text-muted-foreground">
								{hasInput
									? "That doesn't look like SVG — paste markup that includes an <svg> tag."
									: "Your JSX appears here."}
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
