import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_BYOK_MODEL } from "@/lib/config/byok";
import { BYOK_CHANGE_EVENT, STORAGE_KEYS } from "@/lib/constants";

import { byokModelStorage, byokStorage, subscribeByok } from "./byok.utils";

const KEY = "AIzaSyFakeUserKey1234567890123456789";

beforeEach(() => {
	window.sessionStorage.clear();
	window.localStorage.clear();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("byokStorage", () => {
	it("round-trips the key through sessionStorage under its namespaced key", () => {
		expect(byokStorage.set(KEY)).toBe(true);
		expect(byokStorage.get()).toBe(KEY);
		expect(window.sessionStorage.getItem(STORAGE_KEYS.byokApiKey)).toBe(KEY);
	});

	// Session-only by design: the key must not survive the tab, so it must never
	// touch localStorage.
	it("never writes the key to localStorage", () => {
		byokStorage.set(KEY);
		expect(window.localStorage.length).toBe(0);
	});

	it("clears the key", () => {
		byokStorage.set(KEY);
		expect(byokStorage.clear()).toBe(true);
		expect(byokStorage.get()).toBeNull();
	});

	// Safari private browsing / partitioned embeds throw on write — the UI must
	// learn the save didn't land instead of claiming success.
	it("reports a failed write instead of claiming the key was saved", () => {
		vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("QuotaExceededError");
		});
		expect(byokStorage.set(KEY)).toBe(false);
	});

	it("reports a failed clear", () => {
		vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
			throw new Error("SecurityError");
		});
		expect(byokStorage.clear()).toBe(false);
	});

	it("returns null instead of throwing when storage is unreadable", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("SecurityError");
		});
		expect(byokStorage.get()).toBeNull();
	});

	it("notifies subscribers on set and clear", () => {
		const onChange = vi.fn();
		const unsubscribe = subscribeByok(onChange);
		byokStorage.set(KEY);
		byokStorage.clear();
		expect(onChange).toHaveBeenCalledTimes(2);
		unsubscribe();
		byokStorage.set(KEY);
		expect(onChange).toHaveBeenCalledTimes(2);
	});

	it("emits the namespaced change event", () => {
		const listener = vi.fn();
		window.addEventListener(BYOK_CHANGE_EVENT, listener);
		byokStorage.set(KEY);
		expect(listener).toHaveBeenCalledOnce();
		window.removeEventListener(BYOK_CHANGE_EVENT, listener);
	});
});

describe("byokModelStorage", () => {
	it("defaults to DEFAULT_BYOK_MODEL when nothing is stored", () => {
		expect(byokModelStorage.get()).toBe(DEFAULT_BYOK_MODEL);
	});

	it("round-trips an allowlisted model", () => {
		byokModelStorage.set("gemini-pro-latest");
		expect(byokModelStorage.get()).toBe("gemini-pro-latest");
	});

	// A hand-edited sessionStorage value must not smuggle an arbitrary model id
	// into the action input.
	it("falls back to the default for a non-allowlisted stored value", () => {
		window.sessionStorage.setItem(STORAGE_KEYS.byokModel, "gemini-9000-ultra");
		expect(byokModelStorage.get()).toBe(DEFAULT_BYOK_MODEL);
	});

	it("clears back to the default", () => {
		byokModelStorage.set("gemini-flash-latest");
		byokModelStorage.clear();
		expect(byokModelStorage.get()).toBe(DEFAULT_BYOK_MODEL);
	});
});
