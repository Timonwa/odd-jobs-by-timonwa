"use client";

import DOMPurify from "dompurify";
import { DownloadIcon, SettingsIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
import { formatSvgMarkup, type IndentUnit, svgToJsx, cn } from "@/lib/utils";
const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
  <path d="M12 2 2 7l10 5 10-5-10-5Z" />
  <path d="m2 17 10 5 10-5" />
  <path d="m2 12 10 5 10-5" />
</svg>`;

type OutputTab = "preview" | "jsx";
type BackgroundId = "light" | "dark" | "checkered";
type QuoteStyle = "double" | "single";

const INDENTS: { label: string; value: IndentUnit }[] = [
	{ label: "2 spaces", value: "  " },
	{ label: "4 spaces", value: "    " },
	{ label: "Tab", value: "\t" },
];

const QUOTES: { label: string; value: QuoteStyle }[] = [
	{ label: "Double", value: "double" },
	{ label: "Single", value: "single" },
];

const BACKGROUNDS: { id: BackgroundId; label: string }[] = [
	{ id: "light", label: "Light" },
	{ id: "dark", label: "Dark" },
	{ id: "checkered", label: "Checkered" },
];

const TABS: { value: OutputTab; label: string }[] = [
	{ value: "jsx", label: "JSX" },
	{ value: "preview", label: "Preview" },
];

// Fill the pane (min the editor's height) so the preview bottom-aligns with the
// code editor even though the input card carries an extra size-controls row.
const PREVIEW_FILL = "min-h-96 flex-1";

// Classic checkerboard, so transparent icons read clearly. `size` in px.
const checker = (size: number): React.CSSProperties => ({
	backgroundColor: "#fff",
	backgroundImage:
		"linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)",
	backgroundSize: `${size}px ${size}px`,
	backgroundPosition: `0 0, 0 ${size / 2}px, ${size / 2}px -${size / 2}px, -${size / 2}px 0`,
});

function backgroundStyle(id: BackgroundId, size: number): React.CSSProperties {
	if (id === "light") return { backgroundColor: "#fff" };
	if (id === "dark") return { backgroundColor: "#171717" };
	return checker(size);
}

function sanitizeComponentName(raw: string): string {
	const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
	if (!cleaned) return "";
	const withLetter = /^[a-zA-Z]/.test(cleaned) ? cleaned : `Icon${cleaned}`;
	return withLetter.charAt(0).toUpperCase() + withLetter.slice(1);
}

function readRootAttr(svg: string, name: string): string {
	const tag = svg.match(/<svg\b[^>]*>/i)?.[0];
	if (!tag) return "";
	return (
		tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? ""
	);
}

function writeRootAttr(svg: string, name: string, value: string): string {
	const tag = svg.match(/<svg\b[^>]*>/i)?.[0];
	if (!tag) return svg;
	const next = new RegExp(`\\b${name}\\s*=`, "i").test(tag)
		? tag.replace(
				new RegExp(`(\\b${name}\\s*=\\s*)(["'])[^"']*\\2`, "i"),
				`$1"${value}"`,
			)
		: tag.replace(/(\s*\/?>)$/, ` ${name}="${value}"$1`);
	return svg.replace(tag, next);
}

/** SVG-to-JSX converter with live preview, attribute rewriting, and optional typed component wrapping. */
export function SvgToJsxTool() {
	// The example ships in the input on mount so the tool is populated from the
	// first paint — users paste over it, upload, or Clear it.
	const [svg, setSvg] = useState(SAMPLE);
	const [componentName, setComponentName] = useState("Icon");
	const [typescript, setTypescript] = useState(false);
	const [indent, setIndent] = useState<IndentUnit>("  ");
	const [quotes, setQuotes] = useState<QuoteStyle>("double");
	const [tab, setTab] = useState<OutputTab>("jsx");
	const [background, setBackground] = useState<BackgroundId>("light");
	const [settingsOpen, setSettingsOpen] = useState(false);
	// Lets the user tweak the generated JSX by hand; discarded once the inputs
	// regenerate it (the stored `base` no longer matches).
	const [edit, setEdit] = useState<{ base: string; value: string } | null>(
		null,
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const settingsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!settingsOpen) return;
		const onDown = (e: MouseEvent) => {
			if (!settingsRef.current?.contains(e.target as Node)) {
				setSettingsOpen(false);
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSettingsOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [settingsOpen]);

	const trimmed = svg.trim();
	const hasSvg = /<svg[\s>]/i.test(trimmed);
	const wrap = componentName.trim().length > 0;

	// Pasted markup is injected via dangerouslySetInnerHTML; sanitize first.
	// DOMPurify needs a real DOM, so it's a no-op during prerender.
	//
	// Gated on the Preview tab being open: sanitizing ran on every keystroke even
	// while the JSX tab was showing, so the cost was paid for output nobody could
	// see. Reading `tab` rather than a ref is what makes switching tabs recompute.
	const safePreview =
		typeof window === "undefined" || tab !== "preview"
			? ""
			: DOMPurify.sanitize(trimmed, {
					USE_PROFILES: { svg: true, svgFilters: true },
				});

	const generated = !hasSvg
		? ""
		: svgToJsx(svg, {
				componentName: wrap ? sanitizeComponentName(componentName) : undefined,
				typescript,
				spreadProps: wrap,
				indent,
				quotes,
			});

	// Show the hand-edited value only while it still applies to the current
	// generated output; otherwise fall back to freshly generated JSX.
	const output = edit && edit.base === generated ? edit.value : generated;

	const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;
		setSvg(formatSvgMarkup(await file.text(), indent));
	};

	const downloadOutput = () => {
		if (!output) return;
		const name = wrap ? sanitizeComponentName(componentName) : "Icon";
		const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${name}.${typescript ? "tsx" : "jsx"}`;
		anchor.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="grid items-stretch gap-4 lg:grid-cols-2">
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
								onClick={() => setSvg(formatSvgMarkup(svg, indent))}
								disabled={!hasSvg}
							>
								Prettify
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setSvg("")}
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
						onChange={onUpload}
					/>

					<div className="grid grid-cols-2 gap-3">
						<SizeInput
							label="Width"
							value={readRootAttr(svg, "width")}
							onChange={(v) => setSvg(writeRootAttr(svg, "width", v))}
						/>
						<SizeInput
							label="Height"
							value={readRootAttr(svg, "height")}
							onChange={(v) => setSvg(writeRootAttr(svg, "height", v))}
						/>
					</div>

					<CodeEditor
						value={svg}
						onValueChange={setSvg}
						textareaId="svg-input"
						placeholder="Paste your <svg>…</svg> markup here"
					/>
				</CardContent>
			</Card>

			<Card className="min-w-0">
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-border/80 pb-2">
						<SegmentedControl
							value={tab}
							onChange={setTab}
							options={TABS}
							ariaLabel="Output view"
						/>
						{tab === "jsx" ? (
							<div className="flex items-center gap-1">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={downloadOutput}
									disabled={!output}
								>
									<DownloadIcon aria-hidden className="h-4 w-4" />
									Download
								</Button>
								<CopyButton value={output} />
							</div>
						) : (
							<div className="flex items-center gap-1.5">
								{BACKGROUNDS.map((bg) => (
									<button
										key={bg.id}
										type="button"
										aria-pressed={background === bg.id}
										aria-label={`${bg.label} background`}
										onClick={() => setBackground(bg.id)}
										style={backgroundStyle(bg.id, 8)}
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
								style={backgroundStyle(background, 16)}
								className={cn(
									"flex items-center justify-center overflow-auto no-scrollbar rounded-lg border border-border p-6 [&>svg]:h-40 [&>svg]:w-auto",
									PREVIEW_FILL,
									background === "dark"
										? "text-neutral-100"
										: "text-neutral-900",
								)}
								dangerouslySetInnerHTML={{ __html: safePreview }}
							/>
						) : (
							<p
								className={cn(
									"flex items-center justify-center rounded-lg border border-border bg-muted/40 px-3 text-center text-sm text-muted-foreground",
									PREVIEW_FILL,
								)}
							>
								Your icon appears here.
							</p>
						)
					) : (
						<div className="flex flex-1 flex-col gap-3">
							<div className="flex flex-wrap items-end gap-3">
								<div className="flex flex-1 flex-col gap-2">
									<label
										htmlFor="component-name"
										className="text-sm font-medium"
									>
										Component name
									</label>
									<Input
										id="component-name"
										value={componentName}
										onChange={(e) => setComponentName(e.target.value)}
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
										onChange={(e) => setTypescript(e.target.value === "ts")}
									>
										<option value="js">JavaScript</option>
										<option value="ts">TypeScript</option>
									</Select>
								</div>
								<div ref={settingsRef} className="relative">
									<Button
										type="button"
										variant="outline"
										size="icon-sm"
										aria-label="More options"
										aria-haspopup="menu"
										aria-expanded={settingsOpen}
										onClick={() => setSettingsOpen((open) => !open)}
									>
										<SettingsIcon aria-hidden className="h-4 w-4" />
									</Button>
									{settingsOpen && (
										<div className="absolute right-0 top-full z-20 mt-2 flex w-56 flex-col gap-3 rounded-xl border border-border bg-popover p-3 shadow-lg">
											<div className="flex flex-col gap-2">
												<label htmlFor="indent" className="text-sm font-medium">
													Indent
												</label>
												<Select
													id="indent"
													value={indent}
													onChange={(e) =>
														setIndent(e.target.value as IndentUnit)
													}
												>
													{INDENTS.map((o) => (
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
													onChange={(e) =>
														setQuotes(e.target.value as QuoteStyle)
													}
												>
													{QUOTES.map((o) => (
														<option key={o.value} value={o.value}>
															{o.label}
														</option>
													))}
												</Select>
											</div>
										</div>
									)}
								</div>
							</div>

							{hasSvg ? (
								<CodeEditor
									value={output}
									onValueChange={(value) => setEdit({ base: generated, value })}
									textareaId="jsx-output"
									className="bg-muted/40"
								/>
							) : (
								<p className="flex h-96 items-center justify-center rounded-lg border border-border bg-muted/40 px-3 text-center text-sm text-muted-foreground">
									{trimmed
										? "That doesn't look like SVG — paste markup that includes an <svg> tag."
										: "Your JSX appears here."}
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

/** Numeric-entry field for a single SVG root attribute (width or height). */
function SizeInput({
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
