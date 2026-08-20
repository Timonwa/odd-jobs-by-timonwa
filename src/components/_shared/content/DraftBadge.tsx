import { Badge } from "@/components/ui";

/**
 * Marks an unpublished draft while testing locally. Drafts live in
 * `<dir>/_drafts/`, which only the dev server reads, so this can't reach a build.
 */
export function DraftBadge({ isDraft }: { isDraft: boolean }) {
	if (!isDraft) return null;
	return <Badge variant="draft">Draft</Badge>;
}
