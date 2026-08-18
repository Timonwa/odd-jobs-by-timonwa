import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { STORAGE_KEYS } from "@/lib/constants";

import { useTheme } from "./use-theme";

// jsdom has no matchMedia — a light-scheme stub with the listener API.
const matchMedia = (matches: boolean) =>
	vi.stubGlobal(
		"matchMedia",
		vi.fn().mockReturnValue({
			matches,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}),
	);

beforeEach(() => {
	window.localStorage.clear();
	document.documentElement.classList.remove("dark");
	matchMedia(false);
});

describe("useTheme", () => {
	it("defaults to the system preference", () => {
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe("system");
		expect(result.current.resolvedTheme).toBe("light");
	});

	it("resolves system to dark when the OS prefers dark", () => {
		matchMedia(true);
		const { result } = renderHook(() => useTheme());
		expect(result.current.resolvedTheme).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	it("persists an explicit choice and toggles the html class", () => {
		const { result } = renderHook(() => useTheme());
		act(() => result.current.setTheme("dark"));
		expect(result.current.theme).toBe("dark");
		expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	it("removes the stored value when returning to system", () => {
		const { result } = renderHook(() => useTheme());
		act(() => result.current.setTheme("dark"));
		act(() => result.current.setTheme("system"));
		expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBeNull();
		expect(result.current.theme).toBe("system");
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});

	it("ignores a corrupt stored value", () => {
		window.localStorage.setItem(STORAGE_KEYS.theme, "hotdog-stand");
		const { result } = renderHook(() => useTheme());
		expect(result.current.theme).toBe("system");
	});

	it("syncs across hook instances", () => {
		const first = renderHook(() => useTheme());
		const second = renderHook(() => useTheme());
		act(() => first.result.current.setTheme("dark"));
		expect(second.result.current.theme).toBe("dark");
	});
});
