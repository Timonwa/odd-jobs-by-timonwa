"use client";

import { isBrowser } from "@/lib/utils/is-browser.utils";

/** localStorage-backed external store for useSyncExternalStore; avoids setState-in-effect by modeling persisted state as a subscribable cache. */
export function createLocalStore<T>(opts: {
	read: () => T;
	write: (value: T) => void;
	serverValue: T;
}) {
	const listeners = new Set<() => void>();
	let cache: T = opts.serverValue;
	let loaded = false;

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
		if (isBrowser()) opts.write(value);
		for (const l of listeners) l();
	};

	return { subscribe, getSnapshot, getServerSnapshot, get, set };
}
