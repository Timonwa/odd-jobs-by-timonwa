"use client";

import DOMPurify from "dompurify";
import { useState } from "react";

import {
	SVG_TO_JSX_SAMPLE,
	type SvgOutputTab,
	type SvgPreviewBackground,
	type SvgQuoteStyle,
} from "@/lib/constants";
import { sanitizeComponentName, svgToJsx, type IndentUnit } from "@/lib/utils";

import { SvgToJsxInputPanel } from "./SvgToJsxInputPanel";
import { SvgToJsxOutputPanel } from "./SvgToJsxOutputPanel";

/** SVG-to-JSX converter with live preview, attribute rewriting, and optional typed component wrapping. Owns the shared state; the two panes render it. */
export function SvgToJsxTool() {
	// The example ships in the input on mount so the tool is populated from the
	// first paint — users paste over it, upload, or Clear it.
	const [svg, setSvg] = useState(SVG_TO_JSX_SAMPLE);
	const [componentName, setComponentName] = useState("Icon");
	const [typescript, setTypescript] = useState(false);
	const [indent, setIndent] = useState<IndentUnit>("  ");
	const [quotes, setQuotes] = useState<SvgQuoteStyle>("double");
	const [tab, setTab] = useState<SvgOutputTab>("jsx");
	const [background, setBackground] = useState<SvgPreviewBackground>("light");
	// Lets the user tweak the generated JSX by hand; discarded once the inputs
	// regenerate it (the stored `base` no longer matches).
	const [edit, setEdit] = useState<{ base: string; value: string } | null>(
		null,
	);

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

	function downloadOutput() {
		if (!output) return;
		const name = wrap ? sanitizeComponentName(componentName) : "Icon";
		const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `${name}.${typescript ? "tsx" : "jsx"}`;
		anchor.click();
		URL.revokeObjectURL(url);
	}

	return (
		<div className="grid items-stretch gap-4 lg:grid-cols-2">
			<SvgToJsxInputPanel
				svg={svg}
				onSvgChange={setSvg}
				indent={indent}
				hasSvg={hasSvg}
			/>
			<SvgToJsxOutputPanel
				tab={tab}
				onTabChange={setTab}
				background={background}
				onBackgroundChange={setBackground}
				safePreview={safePreview}
				output={output}
				onOutputEdit={(value) => setEdit({ base: generated, value })}
				onDownload={downloadOutput}
				componentName={componentName}
				onComponentNameChange={setComponentName}
				typescript={typescript}
				onTypescriptChange={setTypescript}
				indent={indent}
				onIndentChange={setIndent}
				quotes={quotes}
				onQuotesChange={setQuotes}
				hasSvg={hasSvg}
				hasInput={trimmed.length > 0}
			/>
		</div>
	);
}
