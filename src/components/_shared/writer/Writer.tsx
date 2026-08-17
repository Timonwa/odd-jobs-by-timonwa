"use client";

import { FilePlus2Icon, Loader2Icon, RefreshCwIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { ArticleCard } from "@/components/_shared/result/ArticleCard";
import { HistorySidebar } from "@/components/_shared/result/HistorySidebar";
import type { SocialPostHistoryType } from "@/lib/types";
import type { WriterRuntimeType } from "@/lib/types";
import { useWriter } from "@/lib/hooks";
import { Button } from "@/components/ui";
import { PostCard } from "./PostCard";
import { GenerateForm } from "./GenerateForm";

/** History row headline: the article title, else the URL, else a text snippet. */
const historyLabel = (h: SocialPostHistoryType): string => {
	if (h.result.article.title) return h.result.article.title;
	if (h.source.kind === "url") return h.source.url;
	const firstLine = h.source.text.trim().split("\n")[0] ?? "";
	return firstLine.slice(0, 80) || "Untitled";
};

export function Writer({ runtime }: { runtime: WriterRuntimeType }) {
	const w = useWriter(runtime);
	const resultsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (w.result) {
			resultsRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	}, [w.result]);

	return (
		<div className="grid gap-6 lg:grid-cols-[1fr_280px]">
			<div className="flex flex-col gap-6 min-w-0">
				<GenerateForm
					sourceKind={w.sourceKind}
					onSourceKindChange={w.setSourceKind}
					url={w.url}
					onUrlChange={w.setUrl}
					text={w.text}
					onTextChange={w.setText}
					textReuse={w.textReuse}
					onToggleTextReuse={w.toggleTextReuse}
					urlReuse={w.urlReuse}
					onToggleUrlReuse={w.toggleUrlReuse}
					onClearSource={w.clearSource}
					platforms={w.platforms}
					onTogglePlatform={w.togglePlatform}
					xThreadLength={w.xThreadLength}
					onXThreadLengthChange={w.setXThreadLength}
					isGenerating={w.isGenerating}
					isBusy={w.isBusy}
					hasResult={Boolean(w.result)}
					isNewArticle={w.isNewArticle}
					onStartOver={w.clearAll}
					error={w.error}
					onSubmit={w.generatePosts}
					templates={w.templates}
					activeTemplateId={w.activeTemplateId}
					onApplyTemplate={w.applyTemplate}
					onSaveTemplate={w.saveTemplate}
					onDeleteTemplate={w.deleteTemplate}
					onUpdateTemplate={w.updateTemplate}
					onRenameTemplate={w.renameTemplate}
				/>

				{w.result && (
					<div ref={resultsRef} className="flex flex-col gap-6">
						<ArticleCard
							article={w.result.article}
							usage={w.lastUsage}
							copied={w.copiedKey === "all"}
							onCopyAll={w.copyAll}
							copyLabel="Copy all posts"
						/>

						<div className="columns-1 md:columns-2 gap-4 [&>*]:mb-4">
							{w.editablePosts.map((post) => (
								<PostCard
									key={post.platform}
									post={post}
									isRegenerating={!!w.regenerating[post.platform]}
									busy={w.isBusy}
									copied={w.copiedKey === `post-${post.platform}`}
									onContentChange={(content) =>
										w.updatePostContent(post.platform, content)
									}
									onThreadPostChange={(index, content) =>
										w.updateThreadPost(post.platform, index, content)
									}
									onCopy={() => w.copyPost(post)}
									onRegenerate={() => w.regeneratePost(post)}
								/>
							))}
						</div>

						<div className="flex flex-col gap-2 sm:flex-row">
							<Button
								onClick={w.regenerateAllPosts}
								variant="outline"
								size="lg"
								className="w-full sm:flex-1"
								disabled={w.isBusy}
								title="Regenerate every post for this article with your current tone and settings"
							>
								{w.isGenerating ? (
									<>
										<Loader2Icon className="w-4 h-4 animate-spin" />
										Regenerating all...
									</>
								) : (
									<>
										<RefreshCwIcon className="w-4 h-4" />
										Regenerate all
									</>
								)}
							</Button>
							<Button
								onClick={w.clearAll}
								variant="outline"
								size="lg"
								className="w-full sm:flex-1"
								disabled={w.isBusy}
								title="Clear these posts and start a fresh article — your saved posts stay in history"
							>
								<FilePlus2Icon className="w-4 h-4" />
								New article
							</Button>
						</div>
					</div>
				)}
			</div>

			<HistorySidebar
				items={w.history.map((h) => ({
					id: h.id,
					kind: h.source.kind,
					title: historyLabel(h),
					timestamp: h.timestamp,
					meta: (
						<>
							<span>·</span>
							<span>{h.platforms.length} platforms</span>
						</>
					),
				}))}
				onLoad={(id) => {
					const entry = w.history.find((e) => e.id === id);
					if (entry) w.loadFromHistory(entry);
				}}
				onRemove={w.removeHistoryEntry}
			/>
		</div>
	);
}
