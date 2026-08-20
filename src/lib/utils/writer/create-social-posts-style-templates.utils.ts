"use client";
// Factory that builds a social-post style-template CRUD hook bound to a tool's stores.

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import type { SocialPostStyleTemplate, SocialPostStyle } from "@/lib/types";

type Store<T> = {
	get: () => T;
	set: (value: T) => void;
	subscribe: (cb: () => void) => () => void;
	getSnapshot: () => T;
	getServerSnapshot: () => T;
};

/** Two hashtag lists hold the same tags, ignoring order and case. */
function isSameHashtags(a: string[], b: string[]): boolean {
	if (a.length !== b.length) return false;
	const lower = new Set(a.map((s) => s.toLowerCase()));
	for (const s of b) if (!lower.has(s.toLowerCase())) return false;
	return true;
}

/** True when two styles are identical on every field. Drives which saved template shows as "active": the current style is compared against each saved one, so the active highlight lights up on an exact match and clears the moment the user changes any setting. Field-by-field (not `===`) because styles hold array fields. */
function isStylesEqual(a: SocialPostStyle, b: SocialPostStyle): boolean {
	return (
		a.voice === b.voice &&
		a.tone === b.tone &&
		a.emojiLevel === b.emojiLevel &&
		a.hashtagLevel === b.hashtagLevel &&
		a.postLength === b.postLength &&
		isSameHashtags(a.alwaysIncludeHashtags, b.alwaysIncludeHashtags) &&
		isSameHashtags(a.neverUseHashtags, b.neverUseHashtags)
	);
}

type SocialPostStyleTemplatesOptions = {
	styleStorage: Store<SocialPostStyle>;
	styleTemplatesStorage: Store<SocialPostStyleTemplate[]>;
	starterStyleTemplates: Omit<SocialPostStyleTemplate, "id" | "createdAt">[];
	maxStyleTemplates: number;
};

/** Builds a style-template CRUD hook bound to a tool's stores — save/apply/rename/update/delete named writing styles, with the active template derived from the current style. */
export function createSocialPostsStyleTemplates(
	opts: SocialPostStyleTemplatesOptions,
) {
	const {
		styleStorage,
		styleTemplatesStorage,
		starterStyleTemplates,
		maxStyleTemplates,
	} = opts;

	return function useStyleTemplates() {
		const style = useSyncExternalStore(
			styleStorage.subscribe,
			styleStorage.getSnapshot,
			styleStorage.getServerSnapshot,
		);
		const templates = useSyncExternalStore(
			styleTemplatesStorage.subscribe,
			styleTemplatesStorage.getSnapshot,
			styleTemplatesStorage.getServerSnapshot,
		);

		const activeId = useMemo(
			() => templates.find((t) => isStylesEqual(t.style, style))?.id ?? null,
			[templates, style],
		);

		useEffect(() => {
			if (styleTemplatesStorage.get().length > 0) return;
			styleTemplatesStorage.set(
				starterStyleTemplates.map((t) => ({
					...t,
					id: crypto.randomUUID(),
					createdAt: Date.now(),
				})),
			);
		}, []);

		const save = useCallback((name: string) => {
			const trimmed = name.trim();
			if (!trimmed) return;
			const entry: SocialPostStyleTemplate = {
				id: crypto.randomUUID(),
				name: trimmed,
				createdAt: Date.now(),
				style: styleStorage.get(),
			};
			// Replace any existing template with the same name (case-insensitive).
			const without = styleTemplatesStorage
				.get()
				.filter((t) => t.name.toLowerCase() !== trimmed.toLowerCase());
			styleTemplatesStorage.set(
				[entry, ...without].slice(0, maxStyleTemplates),
			);
		}, []);

		const apply = useCallback((t: SocialPostStyleTemplate) => {
			styleStorage.set(t.style);
		}, []);

		const remove = useCallback((id: string) => {
			styleTemplatesStorage.set(
				styleTemplatesStorage.get().filter((t) => t.id !== id),
			);
		}, []);

		// Overwrites the saved style in place — no delete + re-save, so order is preserved.
		const update = useCallback((id: string) => {
			styleTemplatesStorage.set(
				styleTemplatesStorage
					.get()
					.map((t) => (t.id === id ? { ...t, style: styleStorage.get() } : t)),
			);
		}, []);

		const rename = useCallback((id: string, name: string) => {
			const trimmed = name.trim();
			if (!trimmed) return;
			styleTemplatesStorage.set(
				styleTemplatesStorage
					.get()
					.map((t) => (t.id === id ? { ...t, name: trimmed } : t)),
			);
		}, []);

		return { templates, activeId, save, apply, remove, update, rename };
	};
}
