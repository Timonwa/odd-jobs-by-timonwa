"use client";

// The Article to SEO Meta tool's state machine: the generated result, the
// user's edits to it, in-flight flags, history persistence, and the two
// regeneration paths. Lives here rather than in the component because the tool
// is orchestration — pulling this out leaves the component as composition.

import { useEffect, useEffectEvent, useRef, useState } from "react";

import { COPY_FEEDBACK_MS, HISTORY_DEBOUNCE_MS } from "@/lib/constants";
import {
	generateSeoMeta,
	regenerateSeoMetaVariation,
} from "@/lib/server/actions";
import type { SeoMetaFormParams, SeoMetaResult, TokenUsage } from "@/lib/types";
import {
	byokModelStorage,
	byokStorage,
	emitHostedUsage,
	toActionCallErrorMessage,
} from "@/lib/utils";

import { useSeoMetaHistory, type SeoMetaHistory } from "./use-seo-meta-history";

export function useSeoMetaTool() {
	const [result, setResult] = useState<SeoMetaResult | undefined>();
	const [editableVariations, setEditableVariations] = useState<
		SeoMetaResult["variations"]
	>([]);
	const [usage, setUsage] = useState<TokenUsage | null>(null);
	const [loading, setLoading] = useState(false);
	const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(
		null,
	);
	const [regenError, setRegenError] = useState<string | null>(null);
	const [regeneratingAll, setRegeneratingAll] = useState(false);
	const [copiedAll, setCopiedAll] = useState(false);
	const [initial, setInitial] = useState<SeoMetaFormParams | undefined>();
	// Lets the bottom "new article" button clear the form's inputs, which the form owns.
	const formResetRef = useRef<(() => void) | null>(null);
	// Bumped on a history restore to remount the form with fresh seed values (key-reset pattern).
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
		res: SeoMetaResult,
		nextUsage: TokenUsage,
		params: SeoMetaFormParams,
	) {
		setInitial(params);
		setResult(res);
		setEditableVariations(res.variations);
		setUsage(nextUsage);
		upsert({
			source: params.source,
			primaryKeyword: params.primaryKeyword,
			variationCount: params.variationCount,
			result: res,
			usage: nextUsage,
			timestamp: Date.now(),
		});
	}

	function handleLoadHistory(entry: SeoMetaHistory) {
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

	function updateVariation(
		index: number,
		field: "title" | "description",
		value: string,
	) {
		setEditableVariations((cur) =>
			cur.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
		);
	}

	// Passes the current set so the model returns a fresh angle rather than a near-duplicate; targets `initial`, not whatever's typed in the form.
	async function regenerateVariation(index: number) {
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
		} catch (error) {
			setRegenError(toActionCallErrorMessage(error, "seo-meta:regenerate-one"));
		} finally {
			setRegeneratingIndex(null);
		}
	}

	function handleReset() {
		setResult(undefined);
		setEditableVariations([]);
		setUsage(null);
		setInitial(undefined);
		setRegenError(null);
	}

	async function handleCopyAll() {
		const text = editableVariations
			.map(
				(v, i) =>
					`Variation ${i + 1}\nTitle: ${v.title}\nDescription: ${v.description}`,
			)
			.join("\n\n");
		try {
			// Awaited so a blocked clipboard (no user activation, insecure context)
			// doesn't leave the UI claiming "Copied" with nothing copied.
			await navigator.clipboard.writeText(text);
			setCopiedAll(true);
			setTimeout(() => setCopiedAll(false), COPY_FEEDBACK_MS);
		} catch {
			setRegenError(
				"Your browser blocked copying. Select the text and copy manually.",
			);
		}
	}

	async function regenerateAll() {
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
		} catch (error) {
			setRegenError(toActionCallErrorMessage(error, "seo-meta:regenerate-all"));
		} finally {
			setRegeneratingAll(false);
		}
	}

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
		const id = setTimeout(persistEdits, HISTORY_DEBOUNCE_MS);
		return () => clearTimeout(id);
	}, [editableVariations]);

	return {
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
		/** Any run in flight; every action button gates on this so requests can't race. */
		busy: loading || regeneratingAll || regeneratingIndex !== null,
		handleResult,
		handleLoadHistory,
		updateVariation,
		regenerateVariation,
		handleReset,
		handleCopyAll,
		regenerateAll,
	};
}
