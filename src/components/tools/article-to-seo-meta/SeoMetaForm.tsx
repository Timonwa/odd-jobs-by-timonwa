"use client";

import { FilePlus2Icon, Loader2Icon, SparklesIcon } from "lucide-react";
import {
	type RefObject,
	useActionState,
	useEffect,
	useId,
	useState,
} from "react";
import { useFormStatus } from "react-dom";

import { ArticleSourceInput } from "@/components/_shared/source";
import { ErrorNotice } from "@/components/_shared/result";
import { useArticleSource } from "@/lib/hooks";
import type {
	ArticleSource,
	SeoMetaFormParams,
	SeoMetaResult,
	TokenUsage,
} from "@/lib/types";
import { MAX_ARTICLE_INPUT_CHARS } from "@/lib/constants";
import { Button, Input, SegmentedControl } from "@/components/ui";

import { generateSeoMeta } from "@/lib/server/actions";
import {
	byokModelStorage,
	byokStorage,
	emitHostedUsage,
	toActionCallErrorMessage,
} from "@/lib/utils";

type SeoMetaFormState = { error?: string } | null;

type SeoMetaFormProps = {
	onResult: (
		result: SeoMetaResult,
		usage: TokenUsage,
		params: SeoMetaFormParams,
	) => void;
	onLoadingChange?: (loading: boolean) => void;
	onReset?: () => void;
	resetRef?: RefObject<(() => void) | null>;
	busy?: boolean;
	initial?: SeoMetaFormParams;
	hasResult?: boolean;
};

function SubmitButton({
	disabled,
	isNewArticle,
}: {
	disabled?: boolean;
	isNewArticle?: boolean;
}) {
	const { pending } = useFormStatus();
	return (
		<Button
			type="submit"
			size="lg"
			className="w-full sm:flex-1"
			data-umami-event="tool-generate"
			data-umami-event-tool="article-to-seo-meta"
			disabled={pending || disabled}
		>
			{pending ? (
				<>
					<Loader2Icon className="w-4 h-4 animate-spin" />
					{isNewArticle ? "Generating…" : "Regenerating…"}
				</>
			) : (
				<>
					<SparklesIcon className="w-4 h-4" />
					{isNewArticle ? "Generate variations" : "Regenerate variations"}
				</>
			)}
		</Button>
	);
}

export function SeoMetaForm({
	onResult,
	onLoadingChange,
	onReset,
	resetRef,
	busy,
	initial,
	hasResult,
}: SeoMetaFormProps) {
	const initialSource = initial?.source;
	const {
		text: article,
		setText: setArticle,
		url,
		setUrl,
		sourceKind,
		setSourceKind,
		textReuse,
		toggleTextReuse,
		urlReuse,
		toggleUrlReuse,
		clear: clearArticle,
	} = useArticleSource({
		kind: initialSource?.kind ?? "text",
		url: initialSource?.kind === "url" ? initialSource.url : "",
		text: initialSource?.kind === "text" ? initialSource.text : "",
	});
	const [keyword, setKeyword] = useState(initial?.primaryKeyword ?? "");
	const [count, setCount] = useState<1 | 2 | 3>(initial?.variationCount ?? 3);
	const keywordId = useId();

	const articleLen = article.length;
	const overLimit = articleLen > MAX_ARTICLE_INPUT_CHARS;
	const hasInput =
		sourceKind === "url" ? url.trim().length > 0 : article.trim().length > 0;

	// "Regenerate" only when the form's input is still the article that produced
	// the results on screen. A changed source reads as "Generate" so it never
	// looks like it will overwrite the current variations.
	const currentSourceKey =
		sourceKind === "url" ? `url:${url.trim()}` : `text:${article}`;
	const generated = initial?.source;
	const generatedKey = generated
		? generated.kind === "url"
			? `url:${generated.url.trim()}`
			: `text:${generated.text}`
		: null;
	const isNewArticle =
		!hasResult || !generatedKey || currentSourceKey !== generatedKey;

	const handleNewArticle = () => {
		setUrl("");
		setArticle("");
		setKeyword("");
		onReset?.();
	};

	// Expose the reset so a button outside the form can trigger it. Assigned on
	// every render so it always points at the latest closure.
	useEffect(() => {
		if (resetRef) resetRef.current = handleNewArticle;
	});

	// The form action validates client-side, calls the server action, and hands
	// results straight to the parent — returning only an error string for display
	// (React 19 useActionState). No effects needed.
	const [state, formAction, isPending] = useActionState<SeoMetaFormState>(
		async (): Promise<SeoMetaFormState> => {
			const source: ArticleSource =
				sourceKind === "url"
					? { kind: "url", url: url.trim() }
					: { kind: "text", text: article };

			if (source.kind === "url") {
				if (!source.url) return { error: "Paste a link before generating." };
			} else {
				if (!source.text.trim())
					return { error: "Paste your article before generating." };
				if (overLimit)
					return {
						error: `Your article is too long. Keep it under ${MAX_ARTICLE_INPUT_CHARS.toLocaleString()} characters, then try again.`,
					};
			}

			onLoadingChange?.(true);
			try {
				const byokKey = byokStorage.get() ?? undefined;
				const trimmedKeyword = keyword.trim() || undefined;
				const res = await generateSeoMeta({
					source,
					primaryKeyword: trimmedKeyword,
					variationCount: count,
					byokApiKey: byokKey,
					byokModel: byokKey ? byokModelStorage.get() : undefined,
				});
				if (!res.ok) return { error: res.error };
				emitHostedUsage(res.remaining);
				onResult(res.result, res.usage, {
					source,
					primaryKeyword: trimmedKeyword,
					variationCount: count,
				});
				return null;
			} catch (error) {
				return {
					error: toActionCallErrorMessage(error, "seo-meta:generate"),
				};
			} finally {
				onLoadingChange?.(false);
			}
		},
		null,
	);

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<ArticleSourceInput
				sourceKind={sourceKind}
				onSourceKindChange={setSourceKind}
				url={url}
				onUrlChange={setUrl}
				urlReuse={urlReuse}
				onToggleUrlReuse={toggleUrlReuse}
				text={article}
				onTextChange={setArticle}
				textReuse={textReuse}
				onToggleTextReuse={toggleTextReuse}
				onClearText={clearArticle}
				disabled={isPending}
				maxChars={MAX_ARTICLE_INPUT_CHARS}
			/>

			<div>
				<label htmlFor={keywordId} className="block text-sm font-medium mb-2">
					Primary keyword{" "}
					<span className="text-muted-foreground font-normal">(optional)</span>
				</label>
				<Input
					id={keywordId}
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					placeholder="e.g. agent memory patterns"
					disabled={isPending}
				/>
				<p className="mt-1 text-xs text-muted-foreground">
					If set, it appears in every title and description.
				</p>
			</div>

			<fieldset>
				<legend className="block text-sm font-medium mb-2">Variations</legend>
				<SegmentedControl
					value={count}
					onChange={setCount}
					disabled={isPending}
					options={([1, 2, 3] as const).map((n) => ({
						value: n,
						label: String(n),
					}))}
				/>
			</fieldset>

			{state?.error && <ErrorNotice message={state.error} />}

			<div className="flex flex-col gap-2 sm:flex-row">
				<SubmitButton
					disabled={!hasInput || (sourceKind === "text" && overLimit) || busy}
					isNewArticle={isNewArticle}
				/>
				{hasResult && (
					<Button
						type="button"
						variant="outline"
						size="lg"
						onClick={handleNewArticle}
						disabled={isPending || busy}
						className="w-full sm:w-auto"
						title="Clear the form and results to start a fresh article — saved results stay in history"
					>
						<FilePlus2Icon aria-hidden className="w-4 h-4" />
						New article
					</Button>
				)}
			</div>
		</form>
	);
}
