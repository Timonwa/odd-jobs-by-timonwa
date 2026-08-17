/** Supported indentation unit for pretty-printed SVG/JSX output. */
export type IndentUnit = "  " | "    " | "\t";

/** A single parsed attribute name paired with its value (null for boolean attrs). */
export type ParsedAttr = { name: string; value: string | null };

type MarkupNode =
	| { kind: "open"; name: string; attrs: string; selfClose: boolean }
	| { kind: "close"; name: string }
	| { kind: "comment"; text: string }
	| { kind: "text"; text: string };

/** Format a tag's raw attribute substring into the printed attribute string. */
export type AttrFormatter = (rawAttrs: string) => string;

/** Drop the XML declaration and doctype; keep everything renderable. */
export function stripXmlPreamble(input: string): string {
	return input
		.replace(/<\?xml[\s\S]*?\?>/g, "")
		.replace(/<!DOCTYPE[\s\S]*?>/gi, "")
		.trim();
}

/** Split markup into a flat node stream (best-effort; no full XML parser). */
export function tokenizeMarkup(input: string): MarkupNode[] {
	const nodes: MarkupNode[] = [];
	const re = /<!--([\s\S]*?)--!?>|<([\s\S]*?)>/g;
	let last = 0;
	let m: RegExpExecArray | null;
	while ((m = re.exec(input))) {
		if (m.index > last) {
			const text = input.slice(last, m.index).trim();
			if (text) nodes.push({ kind: "text", text });
		}
		last = re.lastIndex;
		if (m[1] !== undefined) {
			nodes.push({ kind: "comment", text: m[1].trim() });
			continue;
		}
		const inner = m[2].trim();
		if (inner.startsWith("/")) {
			nodes.push({ kind: "close", name: inner.slice(1).trim() });
			continue;
		}
		let body = inner;
		let selfClose = false;
		if (body.endsWith("/")) {
			selfClose = true;
			body = body.slice(0, -1).trim();
		}
		const name = body.match(/^[\w:.-]+/)?.[0] ?? body;
		nodes.push({
			kind: "open",
			name,
			attrs: body.slice(name.length).trim(),
			selfClose,
		});
	}
	if (last < input.length) {
		const text = input.slice(last).trim();
		if (text) nodes.push({ kind: "text", text });
	}
	return nodes;
}

/** Parse a raw attribute string into name/value pairs (both quote styles). */
export function parseAttrs(raw: string): ParsedAttr[] {
	const attrs: ParsedAttr[] = [];
	const re = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(raw))) {
		if (m[2] !== undefined) attrs.push({ name: m[1], value: m[2] });
		else if (m[3] !== undefined) attrs.push({ name: m[1], value: m[3] });
		else attrs.push({ name: m[1], value: null });
	}
	return attrs;
}

/** Wrap `value` in `quote`, falling back to the other quote if it collides. */
export function quoteValue(value: string, quote: '"' | "'"): string {
	const q = value.includes(quote) ? (quote === '"' ? "'" : '"') : quote;
	return `${q}${value}${q}`;
}

/** Re-emit nodes one element per line, indented; `formatAttrs` shapes each tag. */
export function printMarkup(
	nodes: MarkupNode[],
	indent: IndentUnit,
	formatAttrs: AttrFormatter,
	dropComments = false,
): string {
	const lines: string[] = [];
	let depth = 0;
	for (const node of nodes) {
		const pad = indent.repeat(depth);
		if (node.kind === "comment") {
			if (!dropComments) lines.push(`${pad}<!-- ${node.text} -->`);
		} else if (node.kind === "text") {
			lines.push(`${pad}${node.text}`);
		} else if (node.kind === "close") {
			depth = Math.max(0, depth - 1);
			lines.push(`${indent.repeat(depth)}</${node.name}>`);
		} else {
			const attrs = formatAttrs(node.attrs);
			const attrStr = attrs ? ` ${attrs}` : "";
			if (node.selfClose) {
				lines.push(`${pad}<${node.name}${attrStr} />`);
			} else {
				lines.push(`${pad}<${node.name}${attrStr}>`);
				depth++;
			}
		}
	}
	return lines.join("\n");
}

const svgAttrFormatter: AttrFormatter = (raw) =>
	parseAttrs(raw)
		.map((a) =>
			a.value === null ? a.name : `${a.name}=${quoteValue(a.value, '"')}`,
		)
		.join(" ");

/** Pretty-print SVG markup: re-indent, keep attribute names, double-quote. */
export function formatSvgMarkup(input: string, indent: IndentUnit): string {
	const cleaned = stripXmlPreamble(input);
	const nodes = tokenizeMarkup(cleaned);
	if (!nodes.length) return input.trim();
	return printMarkup(nodes, indent, svgAttrFormatter);
}
