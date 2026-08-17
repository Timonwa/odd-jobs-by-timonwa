import { ToolGrid } from "@/components/_shared/tool";
import { getRelatedTools } from "@/lib/config/tools";

/** "More tools" grid — same-category tools first, backfilled to `max` from the TOOLS config. */
export function MoreTools({
	currentSlug,
	max = 3,
}: {
	currentSlug: string;
	max?: number;
}) {
	const others = getRelatedTools(currentSlug, max);
	if (others.length === 0) return null;

	return (
		<section
			aria-labelledby="more-tools-heading"
			className="flex flex-col gap-4"
		>
			<h2
				id="more-tools-heading"
				className="text-xl font-semibold tracking-tight"
			>
				More tools
			</h2>
			<ToolGrid tools={others} />
		</section>
	);
}
