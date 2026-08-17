"use client";
// The shared writer engine's central hook — wires the article source, generation, editing, history, and style templates for any writer tool.

import {
	useCallback,
	useEffect,
	useEffectEvent,
	useMemo,
	useState,
	useSyncExternalStore,
	useTransition,
} from "react";

import type {
	WriterRuntime,
	ArticleSource,
	SocialPost,
	SocialPostsResult,
	TokenUsage,
	SocialPostHistory,
} from "@/lib/types";
import { useArticleSource } from "@/lib/hooks/use-article-source";
import {
	articleSourceIdentity,
	buildAllPostsCopyText,
	buildPostCopyText,
	byokModelStorage,
	byokStorage,
	emitHostedUsage,
} from "@/lib/utils";
/** Central state and action hook for the writer engine — wires the article source, generation, editing, history, and style templates. Stores, server actions, and the history/template hooks are injected via `runtime`, so one engine powers several tools. */
export function useWriter(runtime: WriterRuntime) {
	const {
		styleStorage,
		workflowStorage,
		setTone,
		togglePlatform,
		setXThreadLength,
	} = runtime.stores;
	const { onGenerate, onRegenerate } = runtime;

	const {
		text,
		setText,
		url,
		setUrl,
		sourceKind,
		setSourceKind,
		textReuse,
		toggleTextReuse,
		urlReuse,
		toggleUrlReuse,
		clear: clearSource,
	} = useArticleSource();

	// Persisted state lives in localStorage-backed external stores — read as the
	// source of truth (no setState-in-effect hydration, no persist effect).
	const workflow = useSyncExternalStore(
		workflowStorage.subscribe,
		workflowStorage.getSnapshot,
		workflowStorage.getServerSnapshot,
	);
	const { platforms, xThreadLength } = workflow;
	const style = useSyncExternalStore(
		styleStorage.subscribe,
		styleStorage.getSnapshot,
		styleStorage.getServerSnapshot,
	);
	// Tone is part of the style now — surfaced on the form via its own picker.
	const { tone } = style;

	// `regeneratePost` uses its own transition but tracks per-post loading via `regenerating` — a single flag can't distinguish cards.
	const [isGenerating, startGenerate] = useTransition();
	const [, startRegenerate] = useTransition();
	const [result, setResult] = useState<SocialPostsResult | null>(null);
	const [editablePosts, setEditablePosts] = useState<SocialPost[]>([]);
	const [error, setError] = useState<string | null>(null);

	// Captured when a run starts so later form edits don't silently change what a regeneratePost sees.
	const [lastSource, setLastSource] = useState<ArticleSource | null>(null);

	const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
	const [copiedKey, setCopiedKey] = useState<string | null>(null);

	const [lastUsage, setLastUsage] = useState<TokenUsage | null>(null);

	const {
		templates,
		activeId: activeTemplateId,
		save: saveTemplate,
		apply: applyTemplate,
		remove: deleteTemplate,
		update: updateTemplate,
		rename: renameTemplate,
	} = runtime.useStyleTemplates();

	const { history, upsert, remove: removeHistoryEntry } = runtime.useHistory();

	// useEffectEvent — reads latest values without them becoming effect dependencies (React 19.2).
	const persistPostEdits = useEffectEvent(() => {
		if (!result || !lastSource || isGenerating || editablePosts.length === 0)
			return;
		upsert({
			source: lastSource,
			style,
			platforms,
			xThreadLength,
			styleTemplateName: templates.find((t) => t.id === activeTemplateId)?.name,
			result: { ...result, posts: editablePosts },
			timestamp: Date.now(),
		});
	});

	// Debounced 600 ms — avoids hammering localStorage on every keystroke.
	useEffect(() => {
		if (editablePosts.length === 0) return;
		const id = setTimeout(persistPostEdits, 600);
		return () => clearTimeout(id);
	}, [editablePosts]);

	const resetResults = useCallback(() => {
		setResult(null);
		setEditablePosts([]);
		setError(null);
		setLastUsage(null);
		setLastSource(null);
	}, []);

	const clearAll = useCallback(() => {
		setUrl("");
		setText("");
		resetResults();
	}, [resetResults, setText, setUrl]);

	const currentSource = useCallback((): ArticleSource | null => {
		if (sourceKind === "url") {
			const trimmed = url.trim();
			return trimmed ? { kind: "url", url: trimmed } : null;
		}
		return text.trim() ? { kind: "text", text } : null;
	}, [sourceKind, url, text]);

	// Drives "Generate" vs "Regenerate" label — true when the form source differs from the article on screen.
	const isNewArticle = useMemo(() => {
		if (!result || !lastSource) return true;
		const cur = currentSource();
		if (!cur) return true;
		return articleSourceIdentity(cur) !== articleSourceIdentity(lastSource);
	}, [result, lastSource, currentSource]);

	// `reset: false` keeps current posts visible until the new set lands — avoids blanking results mid-flight.
	const runPostGeneration = useCallback(
		(source: ArticleSource, { reset }: { reset: boolean }) => {
			if (platforms.length === 0) return;
			if (reset) resetResults();
			else setError(null);

			startGenerate(async () => {
				try {
					const byokKey = byokStorage.get() ?? undefined;
					const response = await onGenerate({
						source,
						platforms,
						xThreadLength,
						style: styleStorage.get(),
						byokApiKey: byokKey,
						byokModel: byokKey ? byokModelStorage.get() : undefined,
					});
					if (!response.ok) {
						setError(response.error);
						return;
					}
					emitHostedUsage(response.remaining);
					const generated = response.data;
					setResult(generated);
					setEditablePosts(generated.posts);
					setLastUsage(generated.usage);
					setLastSource(source);

					// Persist both URL and text generations. Posts are stored only in
					// the user's localStorage — never on our servers — and each entry has
					// a Remove button so the user stays in control.
					upsert({
						source:
							source.kind === "url"
								? { kind: "url", url: generated.article.url || source.url }
								: source,
						style: styleStorage.get(),
						platforms,
						xThreadLength,
						styleTemplateName: templates.find((t) => t.id === activeTemplateId)
							?.name,
						result: generated,
						timestamp: Date.now(),
					});
				} catch {
					setError(
						"We couldn't reach the server. Check your internet connection and try again.",
					);
				}
			});
		},
		[
			platforms,
			xThreadLength,
			resetResults,
			upsert,
			templates,
			activeTemplateId,
			onGenerate,
			styleStorage,
		],
	);

	const generatePosts = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			const source = currentSource();
			if (!source) return;
			runPostGeneration(source, { reset: true });
		},
		[currentSource, runPostGeneration],
	);

	const regenerateAllPosts = useCallback(() => {
		if (!lastSource) return;
		runPostGeneration(lastSource, { reset: false });
	}, [lastSource, runPostGeneration]);

	const updatePostContent = useCallback(
		(platform: SocialPost["platform"], content: string) => {
			setEditablePosts((cur) =>
				cur.map((d) =>
					d.platform === platform
						? { ...d, content, charCount: content.length, thread: undefined }
						: d,
				),
			);
		},
		[],
	);

	const updateThreadPost = useCallback(
		(platform: SocialPost["platform"], index: number, content: string) => {
			setEditablePosts((cur) =>
				cur.map((d) => {
					if (d.platform !== platform || !d.thread) return d;
					const thread = d.thread.map((p, i) => (i === index ? content : p));
					return {
						...d,
						thread,
						charCount: Math.max(...thread.map((p) => p.length)),
					};
				}),
			);
		},
		[],
	);

	const regeneratePost = useCallback(
		(post: SocialPost) => {
			if (!lastSource) return;
			// Immediate per-card feedback (urgent), then the async work runs in a
			// transition so the regenerated post render stays non-blocking.
			setRegenerating((r) => ({ ...r, [post.platform]: true }));
			setError(null);
			startRegenerate(async () => {
				try {
					const byokKey = byokStorage.get() ?? undefined;
					const response = await onRegenerate({
						source: lastSource,
						platform: post.platform,
						xThreadLength,
						style: styleStorage.get(),
						byokApiKey: byokKey,
						byokModel: byokKey ? byokModelStorage.get() : undefined,
					});
					if (!response.ok) {
						setError(response.error);
						return;
					}
					emitHostedUsage(response.remaining);
					setEditablePosts((cur) =>
						cur.map((d) => (d.platform === post.platform ? response.post : d)),
					);
					setLastUsage(response.usage);
				} catch {
					setError(
						"We couldn't reach the server. Check your internet connection and try again.",
					);
				} finally {
					setRegenerating((r) => ({ ...r, [post.platform]: false }));
				}
			});
		},
		[lastSource, xThreadLength, onRegenerate, styleStorage],
	);

	const copy = useCallback(async (key: string, text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedKey(key);
			setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1500);
		} catch {
			setError(
				"Your browser blocked copying. Select the text and copy it manually instead.",
			);
		}
	}, []);

	const loadFromHistory = useCallback(
		(entry: SocialPostHistory) => {
			if (entry.source.kind === "url") {
				setSourceKind("url");
				setUrl(entry.source.url);
				setText("");
			} else {
				setSourceKind("text");
				setText(entry.source.text);
				setUrl("");
			}
			workflowStorage.set({
				platforms: entry.platforms,
				xThreadLength: entry.xThreadLength,
			});
			styleStorage.set(entry.style);
			setResult(entry.result);
			setEditablePosts(entry.result.posts);
			setLastUsage(entry.result.usage ?? null);
			setLastSource(entry.source);
			setError(null);
		},
		[setText, setUrl, setSourceKind, styleStorage, workflowStorage],
	);

	// Single busy gate — prevents a second in-flight request racing the first.
	const isBusy = isGenerating || Object.values(regenerating).some(Boolean);

	return {
		sourceKind,
		setSourceKind,
		url,
		setUrl,
		text,
		setText,
		textReuse,
		toggleTextReuse,
		urlReuse,
		toggleUrlReuse,
		clearSource,
		tone,
		setTone,
		platforms,
		togglePlatform,
		xThreadLength,
		setXThreadLength,
		isGenerating,
		isBusy,
		isNewArticle,
		result,
		editablePosts,
		error,
		regenerating,
		copiedKey,
		lastUsage,
		history,
		generatePosts,
		regenerateAllPosts,
		updatePostContent,
		updateThreadPost,
		regeneratePost,
		copy,
		copyAll: () =>
			copy("all", buildAllPostsCopyText(editablePosts, result?.article.url)),
		copyPost: (post: SocialPost) =>
			copy(
				`post-${post.platform}`,
				buildPostCopyText(post, result?.article.url),
			),
		clearAll,
		loadFromHistory,
		removeHistoryEntry,
		templates,
		activeTemplateId,
		saveTemplate,
		applyTemplate,
		deleteTemplate,
		updateTemplate,
		renameTemplate,
	};
}
