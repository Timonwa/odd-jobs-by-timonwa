"use client";

import { isBrowser } from "@/lib/utils/is-browser.utils";

/** localStorage-backed external store for useSyncExternalStore; avoids setState-in-effect by modeling persisted state as a subscribable cache. */
export function createLocalStore<T>(opts: {
	read: () => T;
	write: (value: T) => void;
	serverValue: T;
	/** Delay before persisting, in ms. The in-memory cache and subscribers update immediately either way; only the disk write waits. 0 writes synchronously. */
	writeDelayMs?: number;
}) {
	const listeners = new Set<() => void>();
	let cache: T = opts.serverValue;
	let loaded = false;
	const writeDelayMs = opts.writeDelayMs ?? 0;
	let pendingWrite: ReturnType<typeof setTimeout> | null = null;

	// Serializing a whole article on every keystroke blocks the main thread each
	// time, which is exactly what INP measures. Coalescing the writes keeps the UI
	// responsive; the flush-on-hide below is what stops a coalesced write being
	// lost if the tab goes away mid-debounce.
	const persist = (value: T) => {
		if (!isBrowser()) return;
		if (writeDelayMs === 0) {
			opts.write(value);
			return;
		}
		if (pendingWrite) clearTimeout(pendingWrite);
		pendingWrite = setTimeout(() => {
			pendingWrite = null;
			opts.write(cache);
		}, writeDelayMs);
	};

	const flush = () => {
		if (!pendingWrite) return;
		clearTimeout(pendingWrite);
		pendingWrite = null;
		opts.write(cache);
	};

	if (isBrowser()) {
		// `visibilitychange` rather than `beforeunload`: it fires on mobile tab
		// switches and app backgrounding, where `beforeunload` often doesn't.
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "hidden") flush();
		});
	}

	const onExternalChange = () => {
		loaded = false; // a write in another tab invalidates our cache
		for (const l of listeners) l();
	};

	const getSnapshot = (): T => {
		if (!isBrowser()) return opts.serverValue;
		if (!loaded) {
			cache = opts.read();
			loaded = true;
		}
		return cache;
	};

	const getServerSnapshot = (): T => opts.serverValue;

	const subscribe = (listener: () => void) => {
		const first = listeners.size === 0;
		listeners.add(listener);
		if (first && isBrowser())
			window.addEventListener("storage", onExternalChange);
		return () => {
			listeners.delete(listener);
			if (listeners.size === 0 && isBrowser())
				window.removeEventListener("storage", onExternalChange);
		};
	};

	const get = (): T => getSnapshot();

	const set = (value: T) => {
		cache = value;
		loaded = true;
		persist(value);
		for (const l of listeners) l();
	};

	return { subscribe, getSnapshot, getServerSnapshot, get, set, flush };
}
