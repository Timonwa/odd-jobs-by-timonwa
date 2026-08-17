/**
 * Compact "5m ago" / "2h ago" / "3d ago" formatter. Shared across tools so
 * history UIs and any other timestamped lists read consistently.
 */
export const timeAgo = (ts: number) => {
	const diff = Date.now() - ts;
	const mins = Math.round(diff / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.round(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	return `${Math.round(hrs / 24)}d ago`;
};
