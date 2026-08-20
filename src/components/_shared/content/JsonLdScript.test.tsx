import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JsonLdScript } from "./JsonLdScript";

describe("JsonLdScript", () => {
	const getScript = (container: HTMLElement) =>
		container.querySelector('script[type="application/ld+json"]');

	it("renders the data as a JSON-LD script block", () => {
		const { container } = render(
			<JsonLdScript data={{ "@type": "WebSite", name: "Test" }} />,
		);
		const script = getScript(container);
		expect(script).not.toBeNull();
		expect(JSON.parse(script!.innerHTML)).toEqual({
			"@type": "WebSite",
			name: "Test",
		});
	});

	// A `</script>` inside content must not be able to close the tag early and
	// inject markup into the page.
	it("escapes < so content cannot break out of the script tag", () => {
		const { container } = render(
			<JsonLdScript
				data={{ name: '</script><img src=x onerror="alert(1)">' }}
			/>,
		);
		const html = getScript(container)!.innerHTML;
		expect(html).not.toContain("</script>");
		expect(html).not.toContain("<img");
		expect(html).toContain("\\u003c");
		// Escaping stays invisible to a JSON-LD consumer.
		expect(JSON.parse(html)).toEqual({
			name: '</script><img src=x onerror="alert(1)">',
		});
	});
});
