"use client";

/** Validated JSON-array reader/writer for localStorage; swallows errors and falls back to an empty list so a corrupt entry never crashes a tool. */
export function createLocalStorageJson<T>(
	key: string,
	guard: (value: unknown) => value is T,
): { load: () => T[]; save: (items: T[]) => void } {
	return {
		load: () => {
			try {
				const raw = window.localStorage.getItem(key);
				if (!raw) return [];
				const parsed = JSON.parse(raw) as unknown[];
				return Array.isArray(parsed) ? parsed.filter(guard) : [];
			} catch {
				return [];
			}
		},
		save: (items: T[]) => {
			try {
				window.localStorage.setItem(key, JSON.stringify(items));
			} catch {}
		},
	};
}
