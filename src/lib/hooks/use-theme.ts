"use client";
// Hook for reading and setting the app color theme (light/dark/system), persisted and synced across instances.

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { STORAGE_KEYS, THEME_EVENT } from "@/lib/constants";

/** User theme preference — an explicit choice, or "system" to follow the OS. */
export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const readStoredTheme = (): Theme => {
	const v = window.localStorage.getItem(STORAGE_KEYS.theme);
	return v === "dark" || v === "light" ? v : "system";
};

const resolveTheme = (theme: Theme): ResolvedTheme => {
	if (theme !== "system") return theme;
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
};

const applyThemeClass = (resolved: ResolvedTheme) => {
	document.documentElement.classList.toggle("dark", resolved === "dark");
};

/** Subscribe to both explicit theme changes and OS-preference changes. */
function subscribe(onStoreChange: () => void) {
	const mql = window.matchMedia("(prefers-color-scheme: dark)");
	window.addEventListener(THEME_EVENT, onStoreChange);
	mql.addEventListener("change", onStoreChange);
	return () => {
		window.removeEventListener(THEME_EVENT, onStoreChange);
		mql.removeEventListener("change", onStoreChange);
	};
}

// Encodes pref + resolved value so an OS preference change (leaving pref as "system") still yields a new snapshot; a string return keeps it Object.is-stable.
const getSnapshot = (): `${Theme}:${ResolvedTheme}` => {
	const pref = readStoredTheme();
	return `${pref}:${resolveTheme(pref)}`;
};

const getServerSnapshot = (): `${Theme}:${ResolvedTheme}` => "system:light";

/** A hook for reading and setting the app theme — returns the stored preference, the resolved value, and a setter that persists to localStorage and syncs across instances. */
export function useTheme() {
	const snapshot = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot,
	);
	const [theme, resolvedTheme] = snapshot.split(":") as [Theme, ResolvedTheme];

	// Keeps <html> in sync on both user action and OS preference change.
	useEffect(() => {
		applyThemeClass(resolvedTheme);
	}, [resolvedTheme]);

	const setTheme = useCallback((next: Theme) => {
		if (next === "system") window.localStorage.removeItem(STORAGE_KEYS.theme);
		else window.localStorage.setItem(STORAGE_KEYS.theme, next);
		applyThemeClass(resolveTheme(next));
		window.dispatchEvent(new Event(THEME_EVENT));
	}, []);

	return { theme, resolvedTheme, setTheme };
}
