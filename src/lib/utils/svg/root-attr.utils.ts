// Read and rewrite a single attribute on an SVG's root `<svg>` tag, leaving the
// rest of the markup untouched — what the tool's width/height fields edit.

const rootTag = (svg: string): string | undefined =>
	svg.match(/<svg\b[^>]*>/i)?.[0];

/** Value of a root `<svg>` attribute, or "" when the tag or attribute is absent. */
export function readSvgRootAttr(svg: string, name: string): string {
	const tag = rootTag(svg);
	if (!tag) return "";
	return (
		tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? ""
	);
}

/** Sets a root `<svg>` attribute, adding it when missing. Returns the input unchanged if there's no root tag. */
export function writeSvgRootAttr(
	svg: string,
	name: string,
	value: string,
): string {
	const tag = rootTag(svg);
	if (!tag) return svg;
	const next = new RegExp(`\\b${name}\\s*=`, "i").test(tag)
		? tag.replace(
				new RegExp(`(\\b${name}\\s*=\\s*)(["'])[^"']*\\2`, "i"),
				`$1"${value}"`,
			)
		: tag.replace(/(\s*\/?>)$/, ` ${name}="${value}"$1`);
	return svg.replace(tag, next);
}
