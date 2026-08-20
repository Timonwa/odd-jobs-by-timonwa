import type { ReactNode } from "react";

import { JsonLdScript } from "@/components/_shared/content";
import { buildToolJsonLd } from "@/lib/utils";

/** Shell for a tool route — applies the tool's brand scope class and injects its WebApplication JSON-LD. Every tool layout renders this and nothing else. */
export function ToolRouteLayout({
	slug,
	children,
}: {
	slug: string;
	children: ReactNode;
}) {
	return (
		<div className={`tool-${slug} contents`}>
			<JsonLdScript data={buildToolJsonLd(slug)} />
			{children}
		</div>
	);
}
