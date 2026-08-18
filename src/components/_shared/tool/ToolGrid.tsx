import type { Tool } from "@/lib/config/tools";

import { ToolCard } from "./ToolCard";

/** Responsive grid of ToolCards. Shared by the home preview, directory, and MoreTools. */
export function ToolGrid({ tools }: { tools: Tool[] }) {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{tools.map((tool) => (
				<li key={tool.slug}>
					<ToolCard tool={tool} />
				</li>
			))}
		</ul>
	);
}
