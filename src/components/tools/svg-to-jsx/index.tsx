import { CodeXmlIcon } from "lucide-react";

import { ClientToolPage } from "@/components/_shared/page";
import { SvgToJsxTool } from "./SvgToJsxTool";

/** Page-level shell that wires the SVG to JSX Converter into the shared ClientToolPage layout. */
export function SvgToJsxPageContent() {
	return (
		<ClientToolPage
			slug="svg-to-jsx"
			name="SVG to JSX Converter"
			icon={CodeXmlIcon}
			eyebrowLabel="SVG to JSX"
			title={
				<>
					SVG into a <span className="hero-gradient-text">React component</span>
				</>
			}
			subtitle="Paste raw SVG and get clean JSX — attributes renamed to their React names, inline styles turned into objects, and optionally wrapped in a typed component. Nothing leaves your browser."
		>
			<SvgToJsxTool />
		</ClientToolPage>
	);
}
