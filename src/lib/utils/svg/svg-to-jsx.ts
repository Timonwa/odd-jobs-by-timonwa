// Converts an SVG string into JSX/React component source (the SVG to JSX tool).

import {
	type AttrFormatter,
	type IndentUnit,
	parseAttrs,
	printMarkup,
	quoteValue,
	stripXmlPreamble,
	tokenizeMarkup,
} from "./format-svg";

/** Options controlling SVG-to-JSX conversion. */
export type SvgToJsxOptions = {
	componentName?: string;
	typescript?: boolean;
	spreadProps?: boolean;
	indent?: IndentUnit;
	quotes?: "single" | "double";
};

// SVG namespaced attributes have no kebab-to-camel mapping — React spells them
// out explicitly, so they need a lookup rather than the generic camel-caser.
const NAMESPACED_ATTRS: Record<string, string> = {
	"xlink:href": "xlinkHref",
	"xlink:role": "xlinkRole",
	"xlink:title": "xlinkTitle",
	"xlink:show": "xlinkShow",
	"xlink:actuate": "xlinkActuate",
	"xlink:arcrole": "xlinkArcrole",
	"xlink:type": "xlinkType",
	"xmlns:xlink": "xmlnsXlink",
	"xml:space": "xmlSpace",
	"xml:lang": "xmlLang",
	"xml:base": "xmlBase",
};

// Remove HTML comments, repeating until none are left. A single pass can expose a
// new comment it didn't see before (e.g. `<!--<!-->` leaves a `<!--` behind).
function stripComments(input: string): string {
	const re = /<!--[\s\S]*?--!?>/g;
	let prev: string;
	let out = input;
	do {
		prev = out;
		out = out.replace(re, "");
	} while (out !== prev);
	return out;
}

const toCamelCase = (name: string) =>
	name.replace(/[-:]([a-z])/g, (_, c: string) => c.toUpperCase());

function toJsxAttrName(name: string): string {
	if (name === "class") return "className";
	if (name === "for") return "htmlFor";
	// data-* and aria-* keep their dashes in JSX.
	if (/^(data|aria)-/.test(name)) return name;
	if (name in NAMESPACED_ATTRS) return NAMESPACED_ATTRS[name];
	if (name.includes("-") || name.includes(":")) return toCamelCase(name);
	return name;
}

function styleToObject(value: string, quote: '"' | "'"): string {
	const entries = value
		.split(";")
		.map((decl) => decl.trim())
		.filter(Boolean)
		.map((decl) => {
			const i = decl.indexOf(":");
			if (i === -1) return null;
			const prop = decl.slice(0, i).trim();
			const val = decl.slice(i + 1).trim();
			const key = prop.startsWith("--")
				? prop
				: prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
			const keyOut = /^[a-zA-Z_$][\w$]*$/.test(key)
				? key
				: quoteValue(key, quote);
			return `${keyOut}: ${quoteValue(val, quote)}`;
		})
		.filter((entry): entry is string => entry !== null);
	return `{{ ${entries.join(", ")} }}`;
}

function jsxAttrFormatter(quote: '"' | "'"): AttrFormatter {
	return (raw) =>
		parseAttrs(raw)
			.map((a) => {
				if (a.name === "style" && a.value !== null) {
					return `style=${styleToObject(a.value, quote)}`;
				}
				const name = toJsxAttrName(a.name);
				return a.value === null
					? name
					: `${name}=${quoteValue(a.value, quote)}`;
			})
			.join(" ");
}

/** Raw SVG string to JSX: renames attrs to React names, converts inline style strings to objects, re-indents, and optionally wraps in a named component. */
export function svgToJsx(input: string, options: SvgToJsxOptions = {}): string {
	const {
		componentName,
		typescript,
		spreadProps,
		indent = "  ",
		quotes = "double",
	} = options;
	const quote = quotes === "single" ? "'" : '"';

	const cleaned = stripComments(stripXmlPreamble(input));
	const nodes = tokenizeMarkup(cleaned);
	if (!nodes.length) return "";

	let jsx = printMarkup(nodes, indent, jsxAttrFormatter(quote));

	if (spreadProps) {
		jsx = jsx.replace(
			/<svg\b([^>]*?)(\s*\/?)>/,
			(_m, attrs: string, close: string) => `<svg${attrs} {...props}${close}>`,
		);
	}

	if (!componentName) return jsx;

	const propsType = typescript ? ": React.SVGProps<SVGSVGElement>" : "";
	const header = typescript
		? `import * as React from ${quote}react${quote};\n\n`
		: "";
	const body = jsx
		.split("\n")
		.map((line) => indent + line)
		.join("\n");
	return `${header}const ${componentName} = (props${propsType}) => (\n${body}\n);\n\nexport default ${componentName};\n`;
}
