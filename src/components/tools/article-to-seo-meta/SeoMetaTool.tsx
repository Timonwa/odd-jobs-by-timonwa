"use client";

import {
	FilePlus2Icon,
	Loader2Icon,
	RefreshCwIcon,
	TagsIcon,
} from "lucide-react";

import {
	ArticleCard,
	ErrorNotice,
	GenerationStatus,
} from "@/components/_shared/result";
import { SupportNote } from "@/components/_shared/content";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { useSeoMetaTool } from "@/lib/hooks";

import { SeoMetaForm } from "./SeoMetaForm";
import { SeoMetaHistoryPanel } from "./SeoMetaHistoryPanel";
import { SeoMetaLoadingState } from "./SeoMetaLoadingState";
import { SeoMetaResults } from "./SeoMetaResults";

/** Orchestrator for the Article to SEO Meta tool — form, results, history, and regeneration. State lives in `useSeoMetaTool`. */
export function SeoMetaTool() {
	const {
		result,
		editableVariations,
		usage,
		loading,
		setLoading,
		regeneratingIndex,
		regenError,
		regeneratingAll,
		copiedAll,
		initial,
		formResetRef,
		restoreNonce,
		history,
		remove,
		resultsRef,
		busy,
		handleResult,
		handleLoadHistory,
		updateVariation,
		regenerateVariation,
		handleReset,
		handleCopyAll,
		regenerateAll,
	} = useSeoMetaTool();

	return (
		<div className="grid gap-6 lg:grid-cols-[1fr_280px]">
			<div className="flex flex-col gap-6 min-w-0">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<TagsIcon className="w-5 h-5 text-primary" aria-hidden />
							Generate SEO meta tags
						</CardTitle>
						<CardDescription>
							Paste an article&apos;s URL or its text, plus an optional target
							keyword. The agent writes title and description variations
							optimised for search — review, edit, copy, and drop them into your
							CMS.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<GenerationStatus
							isGenerating={busy}
							error={regenError}
							hasResult={Boolean(result)}
							subject="SEO details"
						/>
						<SeoMetaForm
							key={restoreNonce}
							onResult={handleResult}
							onLoadingChange={setLoading}
							onReset={handleReset}
							resetRef={formResetRef}
							busy={busy}
							initial={initial}
							hasResult={Boolean(result)}
						/>
					</CardContent>
				</Card>

				{regenError && <ErrorNotice message={regenError} />}
				{loading && !result ? (
					<SeoMetaLoadingState />
				) : result ? (
					<div ref={resultsRef} className="flex flex-col gap-4">
						<ArticleCard
							article={result.article ?? {}}
							usage={usage}
							copied={copiedAll}
							onCopyAll={handleCopyAll}
							copyLabel="Copy all variations"
						/>
						<SeoMetaResults
							variations={editableVariations}
							regeneratingIndex={regeneratingIndex}
							busy={busy}
							onVariationChange={updateVariation}
							onRegenerate={regenerateVariation}
						/>

						<div className="flex flex-col gap-2 sm:flex-row">
							<Button
								onClick={regenerateAll}
								variant="outline"
								size="lg"
								className="w-full sm:flex-1"
								disabled={busy}
								title="Regenerate every variation for this article"
							>
								{regeneratingAll ? (
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
								onClick={() => formResetRef.current?.()}
								variant="outline"
								size="lg"
								className="w-full sm:flex-1"
								disabled={busy}
								title="Clear these variations and start a fresh article — saved results stay in history"
							>
								<FilePlus2Icon className="w-4 h-4" />
								New article
							</Button>
						</div>

						<SupportNote lead="This tool is free and open source." />
					</div>
				) : null}
			</div>

			<SeoMetaHistoryPanel
				history={history}
				onLoad={handleLoadHistory}
				onRemove={remove}
			/>
		</div>
	);
}
