import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createLocalStore } from "./local-store.utils";

const makeStore = (writeDelayMs?: number) => {
	const write = vi.fn();
	const backing = { value: "initial" };
	const store = createLocalStore<string>({
		read: () => backing.value,
		write: (v) => {
			backing.value = v;
			write(v);
		},
		serverValue: "server",
		writeDelayMs,
	});
	return { store, write, backing };
};

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe("createLocalStore", () => {
	it("reads lazily from storage on first snapshot", () => {
		const { store } = makeStore();
		expect(store.getSnapshot()).toBe("initial");
	});

	it("serves the server value for server snapshots", () => {
		const { store } = makeStore();
		expect(store.getServerSnapshot()).toBe("server");
	});

	it("writes synchronously with no delay and notifies subscribers", () => {
		const { store, write } = makeStore();
		const listener = vi.fn();
		store.subscribe(listener);
		store.set("next");
		expect(write).toHaveBeenCalledWith("next");
		expect(listener).toHaveBeenCalledOnce();
		expect(store.get()).toBe("next");
	});

	it("coalesces delayed writes but updates the cache immediately", () => {
		const { store, write } = makeStore(500);
		store.set("a");
		store.set("b");
		expect(store.get()).toBe("b");
		expect(write).not.toHaveBeenCalled();
		vi.advanceTimersByTime(500);
		expect(write).toHaveBeenCalledTimes(1);
		expect(write).toHaveBeenCalledWith("b");
	});

	it("flush persists a pending write immediately", () => {
		const { store, write } = makeStore(500);
		store.set("a");
		store.flush();
		expect(write).toHaveBeenCalledWith("a");
	});

	// The flush-on-hide is what stops a coalesced write being lost when the tab
	// goes away mid-debounce.
	it("flushes when the document becomes hidden", () => {
		const { store, write } = makeStore(500);
		store.set("a");
		vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
		document.dispatchEvent(new Event("visibilitychange"));
		expect(write).toHaveBeenCalledWith("a");
	});

	it("invalidates the cache when another tab writes", () => {
		const { store, backing } = makeStore();
		store.subscribe(() => {});
		expect(store.getSnapshot()).toBe("initial");
		backing.value = "from-another-tab";
		window.dispatchEvent(new StorageEvent("storage"));
		expect(store.getSnapshot()).toBe("from-another-tab");
	});
});
