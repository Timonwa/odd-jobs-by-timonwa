"use client";
// Hook for a tool's article source (text + URL channels), backed by localStorage so state persists across the tool.

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";

import { STORAGE_KEYS } from "@/lib/constants";
import type { ArticleSourceKind } from "@/lib/types";
import { createLocalStore } from "@/lib/utils";

const TEXT_KEY = STORAGE_KEYS.sourceText;
const URL_KEY = STORAGE_KEYS.sourceUrl;
const TEXT_ENABLED_KEY = STORAGE_KEYS.sourceTextReuse;
const URL_ENABLED_KEY = STORAGE_KEYS.sourceUrlReuse;
const KIND_KEY = STORAGE_KEYS.sourceKind;

const stringStore = (key: string) =>
	createLocalStore<string>({
		read: () => {
			try {
				return window.localStorage.getItem(key) ?? "";
			} catch {
				return "";
			}
		},
		write: (value) => {
			try {
				if (value) window.localStorage.setItem(key, value);
				else window.localStorage.removeItem(key);
			} catch {}
		},
		serverValue: "",
	});

const flagStore = (key: string) =>
	createLocalStore<boolean>({
		read: () => {
			try {
				return window.localStorage.getItem(key) === "1";
			} catch {
				return false;
			}
		},
		write: (value) => {
			try {
				if (value) window.localStorage.setItem(key, "1");
				else window.localStorage.removeItem(key);
			} catch {}
		},
		serverValue: false,
	});

const textStore = stringStore(TEXT_KEY);
const urlStore = stringStore(URL_KEY);
const textEnabledStore = flagStore(TEXT_ENABLED_KEY);
const urlEnabledStore = flagStore(URL_ENABLED_KEY);
// The active tab (url / text), shared across the AI tools so you land on the
// tab you last used. A view pointer, not content — not gated by either reuse.
const kindStore = stringStore(KIND_KEY);

type ArticleSourceSeed =
	string | { text?: string; url?: string; kind?: ArticleSourceKind };

type ArticleSourceState = {
	text: string;
	setText: (value: string) => void;
	textReuse: boolean;
	toggleTextReuse: (next: boolean) => void;
	url: string;
	setUrl: (value: string) => void;
	urlReuse: boolean;
	toggleUrlReuse: (next: boolean) => void;
	sourceKind: ArticleSourceKind;
	setSourceKind: (kind: ArticleSourceKind) => void;
	clear: () => void;
};

/** Article-source state for one tool's source field(s); two opt-in shared channels (text + URL) backed by localStorage external stores so every tool stays in sync. */
export function useArticleSource(
	seed: ArticleSourceSeed = "",
): ArticleSourceState {
	const seedObj = typeof seed === "string" ? { text: seed } : seed;
	const seedText = seedObj.text ?? "";
	const seedUrl = seedObj.url ?? "";
	const seedKind: ArticleSourceKind = seedObj.kind ?? "url";

	const textReuse = useSyncExternalStore(
		textEnabledStore.subscribe,
		textEnabledStore.getSnapshot,
		textEnabledStore.getServerSnapshot,
	);
	const urlReuse = useSyncExternalStore(
		urlEnabledStore.subscribe,
		urlEnabledStore.getSnapshot,
		urlEnabledStore.getServerSnapshot,
	);
	const sharedText = useSyncExternalStore(
		textStore.subscribe,
		textStore.getSnapshot,
		textStore.getServerSnapshot,
	);
	const sharedUrl = useSyncExternalStore(
		urlStore.subscribe,
		urlStore.getSnapshot,
		urlStore.getServerSnapshot,
	);
	const sharedKind = useSyncExternalStore(
		kindStore.subscribe,
		kindStore.getSnapshot,
		kindStore.getServerSnapshot,
	);

	const [localText, setLocalText] = useState(seedText);
	const [localUrl, setLocalUrl] = useState(seedUrl);
	const [localKind, setLocalKind] = useState<ArticleSourceKind>(seedKind);

	// A non-empty seed on mount (history restore) adopts into the matching shared
	// channel when its reuse is on. Writes the external stores only — never React
	// state — so this stays clear of the set-state-in-effect rule.
	const seeded = useRef(false);
	useEffect(() => {
		if (seeded.current) return;
		seeded.current = true;
		if (textEnabledStore.get() && seedText) textStore.set(seedText);
		if (urlEnabledStore.get() && seedUrl) urlStore.set(seedUrl);
		// A history restore also updates the shared "last used tab".
		if (seedObj.kind && (seedText || seedUrl)) kindStore.set(seedObj.kind);
	}, [seedText, seedUrl, seedObj.kind]);

	const text = textReuse ? sharedText : localText;
	const url = urlReuse ? sharedUrl : localUrl;
	const sourceKind: ArticleSourceKind =
		sharedKind === "url" || sharedKind === "text" ? sharedKind : localKind;

	const setSourceKind = useCallback((kind: ArticleSourceKind) => {
		kindStore.set(kind);
		setLocalKind(kind);
	}, []);

	const setText = useCallback((value: string) => {
		if (textEnabledStore.get()) textStore.set(value);
		else setLocalText(value);
	}, []);

	const setUrl = useCallback((value: string) => {
		if (urlEnabledStore.get()) urlStore.set(value);
		else setLocalUrl(value);
	}, []);

	const toggleTextReuse = useCallback(
		(next: boolean) => {
			if (next) {
				// Turning on: what's on screen wins, or adopt the shared source if this
				// box is empty.
				const cur = textStore.get();
				if (localText.trim() || !cur) textStore.set(localText);
			} else {
				// Turning off: keep the visible text so the box doesn't blank out.
				setLocalText(textStore.get());
			}
			textEnabledStore.set(next);
		},
		[localText],
	);

	const toggleUrlReuse = useCallback(
		(next: boolean) => {
			if (next) {
				const cur = urlStore.get();
				if (localUrl.trim() || !cur) urlStore.set(localUrl);
			} else {
				setLocalUrl(urlStore.get());
			}
			urlEnabledStore.set(next);
		},
		[localUrl],
	);

	const clear = useCallback(() => {
		if (textEnabledStore.get()) textStore.set("");
		else setLocalText("");
	}, []);

	return {
		text,
		setText,
		textReuse,
		toggleTextReuse,
		url,
		setUrl,
		urlReuse,
		toggleUrlReuse,
		sourceKind,
		setSourceKind,
		clear,
	};
}
