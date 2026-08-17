import type { Metadata } from "next";

import {
	CREATOR_NAME,
	CREATOR_SAME_AS,
	CREATOR_TWITTER,
	CREATOR_URL,
	REPO_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";

const TOOL_PATH = "/svg-to-jsx";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "SVG to JSX Converter — turn SVG into a React component";
const TOOL_DESCRIPTION =
	"Convert raw SVG markup into clean React/JSX — attributes renamed to their React names, inline styles turned into objects, optionally wrapped in a typed component. Runs in your browser.";

/** Route metadata for the SVG to JSX Converter tool. */
export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "SVG to JSX Converter",
	alternates: { canonical: TOOL_PATH },
	openGraph: {
		type: "website",
		url: TOOL_URL,
		siteName: SITE_NAME,
		title: TOOL_TITLE,
		description: TOOL_DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		site: CREATOR_TWITTER,
		creator: CREATOR_TWITTER,
		title: TOOL_TITLE,
		description: TOOL_DESCRIPTION,
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	name: "SVG to JSX Converter",
	alternateName: "SVG to React Converter",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "DeveloperApplication",
	applicationSubCategory: "Developer tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"svg to jsx",
		"svg to react",
		"svg to react component",
		"convert svg to jsx",
		"svg jsx converter",
		"react svg component",
		"open source svg to jsx",
	].join(", "),
	featureList: [
		"Convert raw SVG markup into clean JSX",
		"Rename attributes to their React names (class → className, kebab-case → camelCase)",
		"Turn inline style strings into style objects",
		"Optionally wrap the SVG in a typed React component",
		"Spread props onto the root <svg>",
		"One-click copy",
		"Runs entirely in your browser — nothing is uploaded",
		"Open source",
	],
	creator: {
		"@type": "Person",
		name: CREATOR_NAME,
		url: CREATOR_URL,
		sameAs: CREATOR_SAME_AS,
	},
	sameAs: [REPO_URL],
};

export default function SvgToJsxLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-svg-to-jsx contents">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
				}}
			/>
			{children}
		</div>
	);
}
