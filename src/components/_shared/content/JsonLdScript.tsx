/** Renders a JSON-LD structured-data block. `<` is escaped so content strings can never close the script tag early. */
export function JsonLdScript({ data }: { data: object }) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data).replace(/</g, "\\u003c"),
			}}
		/>
	);
}
