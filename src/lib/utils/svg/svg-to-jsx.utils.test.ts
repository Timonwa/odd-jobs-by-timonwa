import { describe, expect, it } from "vitest";

import { svgToJsx } from "./svg-to-jsx.utils";

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M0 0h24v24H0z"/></svg>`;

describe("svgToJsx", () => {
	it("camel-cases kebab attributes", () => {
		expect(svgToJsx(SVG)).toContain("fillRule=");
		expect(svgToJsx(SVG)).not.toContain("fill-rule=");
	});

	it("renames class and for to their JSX names", () => {
		const out = svgToJsx(`<svg class="icon"><label for="x">a</label></svg>`);
		expect(out).toContain('className="icon"');
		expect(out).toContain('htmlFor="x"');
	});

	it("keeps data-* and aria-* attribute dashes", () => {
		const out = svgToJsx(`<svg data-testid="a" aria-hidden="true"></svg>`);
		expect(out).toContain('data-testid="a"');
		expect(out).toContain('aria-hidden="true"');
	});

	it("maps namespaced attributes to their React spellings", () => {
		const out = svgToJsx(`<svg xmlns:xlink="x"><use xlink:href="#a"/></svg>`);
		expect(out).toContain('xmlnsXlink="x"');
		expect(out).toContain('xlinkHref="#a"');
	});

	it("converts inline style strings to objects", () => {
		const out = svgToJsx(`<svg style="fill: red; stroke-width: 2"></svg>`);
		expect(out).toContain('style={{ fill: "red", strokeWidth: "2" }}');
	});

	it("strips XML preamble and comments — including nested comment tricks", () => {
		const out = svgToJsx(
			`<?xml version="1.0"?><!--<!--nested--><svg><!-- gone --></svg>`,
		);
		expect(out).not.toContain("<!--");
		expect(out).not.toContain("<?xml");
	});

	it("spreads props onto the root svg when asked", () => {
		expect(
			svgToJsx(`<svg viewBox="0 0 1 1"></svg>`, { spreadProps: true }),
		).toContain("{...props}");
	});

	it("wraps in a typed component when a name and typescript are given", () => {
		const out = svgToJsx(SVG, { componentName: "MyIcon", typescript: true });
		expect(out).toContain(
			"const MyIcon = (props: React.SVGProps<SVGSVGElement>)",
		);
		expect(out).toContain("export default MyIcon;");
		expect(out).toContain('import * as React from "react";');
	});

	it("honors single-quote output", () => {
		const out = svgToJsx(SVG, { quotes: "single" });
		expect(out).toContain("viewBox='0 0 24 24'");
	});

	it("returns empty string for empty or comment-only input", () => {
		expect(svgToJsx("")).toBe("");
		expect(svgToJsx("<!-- nothing -->")).toBe("");
	});
});
