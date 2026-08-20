import { ToolGrid } from "@/components/_shared/tool";
import { getRelatedTools } from "@/lib/config/tools";

import { RelatedSection } from "./RelatedSection";

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
		<RelatedSection id="more-tools" heading="More tools">
			<ToolGrid tools={others} />
		</RelatedSection>
	);
}
