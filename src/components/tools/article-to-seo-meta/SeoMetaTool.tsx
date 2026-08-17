"use client";

import {
	useCallback,
	useEffect,
	useEffectEvent,
	useRef,
	useState,
} from "react";
import {
	FilePlus2Icon,
	Loader2Icon,
	RefreshCwIcon,
	TagsIcon,
} from "lucide-react";

import { ArticleCard } from "@/components/_shared/result/ArticleCard";
import { ErrorNotice } from "@/components/_shared/result/ErrorNotice";
import { HistorySidebar } from "@/components/_shared/result/HistorySidebar";
import { SeoMetaForm, type SeoMetaFormParamsType } from "./SeoMetaForm";
import { SeoMetaResults } from "./SeoMetaResults";
import { useSeoMetaHistory, type SeoMetaHistoryType } from "@/lib/hooks";
import type { SeoMetaResultType, TokenUsageType } from "@/lib/types";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import {
	generateSeoMeta,
	regenerateSeoMetaVariation,
} from "@/lib/server/actions";
import { byokModelStorage, byokStorage } from "@/lib/utils";
import { emitHostedUsage } from "@/lib/utils";

/** History row label — article title, then URL, then a text snippet. */
const historyLabel = (h: SeoMetaHistoryType): string => {
	if (h.result.article?.title) return h.result.article.title;
	if (h.source.kind === "url") return h.source.url;
	return h.source.text.trim().slice(0, 120) || "Article";
};

/** Orchestrator for the Article to SEO Meta tool — form, results, history, and regeneration. */
export function SeoMetaTool() {
	const [result, setResult] = useState<SeoMetaResultType | undefined>();
	const [editableVariations, setEditableVariations] = useState<
		SeoMetaResultType["variations"]
	>([]);
	const [usage, setUsage] = useState<TokenUsageType | null>(null);
	const [loading, setLoading] = useState(false);
	const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(
		null,
	);
	const [regenError, setRegenError] = useState<string | null>(null);
	const [regeneratingAll, setRegeneratingAll] = useState(false);
	const [copiedAll, setCopiedAll] = useState(false);
	const [initial, setInitial] = useState<SeoMetaFormParamsType | undefined>();
	// Lets the bottom "new article" button clear the form's inputs, which the form owns.
	const formResetRef = useRef<(() => void) | null>(null);
	// Bumped on a history restore to remount SeoMetaForm with fresh seed values (key-reset pattern).
	const [restoreNonce, setRestoreNonce] = useState(0);
	const { history, upsert, remove } = useSeoMetaHistory();
	const resultsRef = useRef<HTMLDivElement>(null);

	// Scroll results into view when a new set lands (they render below the form).
	useEffect(() => {
		if (result) {
			resultsRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	}, [result]);

	function handleResult(
		res: SeoMetaResultType,
		u: TokenUsageType,
		params: SeoMetaFormParamsType,
	) {
		setInitial(params);
		setResult(res);
		setEditableVariations(res.variations);
		setUsage(u);
		upsert({
			source: params.source,
			primaryKeyword: params.primaryKeyword,
			variationCount: params.variationCount,
			result: res,
			usage: u,
			timestamp: Date.now(),
		});
	}

	function handleLoadHistory(entry: SeoMetaHistoryType) {
		setInitial({
			source: entry.source,
			primaryKeyword: entry.primaryKeyword,
			variationCount: entry.variationCount,
		});
		setRestoreNonce((n) => n + 1);
		setResult(entry.result);
		setEditableVariations(entry.result.variations);
		setUsage(entry.usage ?? null);
	}

	const updateVariation = useCallback(
		(index: number, field: "title" | "description", value: string) => {
			setEditableVariations((cur) =>
				cur.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
			);
		},
		[],
	);

	// Passes the current set so the model returns a fresh angle rather than a near-duplicate; targets `initial`, not whatever's typed in the form.
	const regenerateVariation = useCallback(
		async (index: number) => {
			if (!initial) return;
			setRegeneratingIndex(index);
			setRegenError(null);
			try {
				const byokKey = byokStorage.get() ?? undefined;
				const res = await regenerateSeoMetaVariation({
					source: initial.source,
					primaryKeyword: initial.primaryKeyword,
					existing: editableVariations,
					byokApiKey: byokKey,
					byokModel: byokKey ? byokModelStorage.get() : undefined,
				});
				if (!res.ok) {
					setRegenError(res.error);
					return;
				}
				emitHostedUsage(res.remaining);
				setEditableVariations((cur) =>
					cur.map((v, i) => (i === index ? res.variation : v)),
				);
				setUsage(res.usage);
			} catch {
				setRegenError(
					"We couldn't reach the server. Check your internet connection and try again.",
				);
			} finally {
				setRegeneratingIndex(null);
			}
		},
		[initial, editableVariations],
	);

	const handleReset = useCallback(() => {
		setResult(undefined);
		setEditableVariations([]);
		setUsage(null);
		setInitial(undefined);
		setRegenError(null);
	}, []);

	const handleCopyAll = useCallback(() => {
		const text = editableVariations
			.map(
				(v, i) =>
					`Variation ${i + 1}\nTitle: ${v.title}\nDescription: ${v.description}`,
			)
			.join("\n\n");
		navigator.clipboard.writeText(text);
		setCopiedAll(true);
		setTimeout(() => setCopiedAll(false), 1200);
	}, [editableVariations]);

	const regenerateAll = useCallback(async () => {
		if (!initial) return;
		setRegeneratingAll(true);
		setRegenError(null);
		try {
			const byokKey = byokStorage.get() ?? undefined;
			const res = await generateSeoMeta({
				source: initial.source,
				primaryKeyword: initial.primaryKeyword,
				variationCount: initial.variationCount,
				byokApiKey: byokKey,
				byokModel: byokKey ? byokModelStorage.get() : undefined,
			});
			if (!res.ok) {
				setRegenError(res.error);
				return;
			}
			emitHostedUsage(res.remaining);
			setResult(res.result);
			setEditableVariations(res.result.variations);
			setUsage(res.usage);
			upsert({
				source: initial.source,
				primaryKeyword: initial.primaryKeyword,
				variationCount: initial.variationCount,
				result: res.result,
				usage: res.usage,
				timestamp: Date.now(),
			});
		} catch {
			setRegenError(
				"We couldn't reach the server. Check your internet connection and try again.",
			);
		} finally {
			setRegeneratingAll(false);
		}
	}, [initial, upsert]);

	// useEffectEvent so the callback always sees fresh result/usage/initial without listing them as effect deps.
	const persistEdits = useEffectEvent(() => {
		if (!result || !initial || editableVariations.length === 0) return;
		upsert({
			source: initial.source,
			primaryKeyword: initial.primaryKeyword,
			variationCount: initial.variationCount,
			result: { ...result, variations: editableVariations },
			usage: usage ?? undefined,
			timestamp: Date.now(),
		});
	});

	useEffect(() => {
		if (editableVariations.length === 0) return;
		const id = setTimeout(persistEdits, 600);
		return () => clearTimeout(id);
	}, [editableVariations]);

	// Any run in flight; every action button gates on this so requests can't race.
	const busy = loading || regeneratingAll || regeneratingIndex !== null;

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
					<LoadingState />
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
					</div>
				) : null}
			</div>

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
					if (entry) handleLoadHistory(entry);
				}}
				onRemove={remove}
			/>
		</div>
	);
}

/** Skeleton placeholder shown while SEO variations are being generated. */
function LoadingState() {
	return (
		<div className="flex flex-col gap-4">
			{[0, 1, 2].map((i) => (
				<Card key={i} className="gap-4 p-5 animate-pulse">
					<div className="h-3 w-20 rounded bg-muted" />
					<div className="flex flex-col gap-2">
						<div className="h-3 w-12 rounded bg-muted" />
						<div className="h-4 w-full rounded bg-muted" />
					</div>
					<div className="flex flex-col gap-2">
						<div className="h-3 w-20 rounded bg-muted" />
						<div className="h-4 w-full rounded bg-muted" />
						<div className="h-4 w-4/5 rounded bg-muted" />
					</div>
				</Card>
			))}
		</div>
	);
}
