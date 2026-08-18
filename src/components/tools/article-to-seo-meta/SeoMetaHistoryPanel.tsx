"use client";

import { HistorySidebar } from "@/components/_shared/result";
import type { SeoMetaHistory } from "@/lib/hooks";

/** History row label — article title, then URL, then a text snippet. */
function historyLabel(entry: SeoMetaHistory): string {
	if (entry.result.article?.title) return entry.result.article.title;
	if (entry.source.kind === "url") return entry.source.url;
	return entry.source.text.trim().slice(0, 120) || "Article";
}

/** Saved-run sidebar for the SEO meta tool — maps history entries to rows and restores one on click. */
export function SeoMetaHistoryPanel({
	history,
	onLoad,
	onRemove,
}: {
	history: SeoMetaHistory[];
	onLoad: (entry: SeoMetaHistory) => void;
	onRemove: (id: string) => void;
}) {
	return (
		<HistorySidebar
			items={history.map((h) => ({
				id: h.id,
				kind: h.source.kind,
				title: historyLabel(h),
				timestamp: h.timestamp,
				meta: (
					<>
						<span>·</span>
						<span>
							{h.variationCount} variation{h.variationCount > 1 ? "s" : ""}
						</span>
						{h.primaryKeyword && (
							<>
								<span>·</span>
								<span className="truncate">
									&ldquo;{h.primaryKeyword}&rdquo;
								</span>
							</>
						)}
					</>
				),
			}))}
			onLoad={(id) => {
				const entry = history.find((e) => e.id === id);
				if (entry) onLoad(entry);
			}}
			onRemove={onRemove}
		/>
	);
}
