// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { ArticleSource } from "@/lib/types";

import { createToolHistory } from "./create-tool-history.utils";

type Entry = { id: string; source: ArticleSource; label: string };

const isEntry = (e: unknown): e is Entry =>
	!!e && typeof e === "object" && typeof (e as Entry).label === "string";

const source = (url: string): ArticleSource => ({ kind: "url", url });

let counter = 0;
const makeHook = (maxHistory?: number) =>
	createToolHistory<Entry>({
		key: `tbt:test:history-${counter++}`,
		isEntry,
		maxHistory,
	});

beforeEach(() => {
	window.localStorage.clear();
});

describe("createToolHistory", () => {
	it("adds entries newest-first", () => {
		const { result } = renderHook(makeHook());
		act(() =>
			result.current.upsert({ source: source("https://a.com"), label: "A" }),
		);
		act(() =>
			result.current.upsert({ source: source("https://b.com"), label: "B" }),
		);
		expect(result.current.history.map((e) => e.label)).toEqual(["B", "A"]);
	});

	// Re-running the same article updates its entry instead of piling up a
	// record per run — and keeps the original id so restores stay stable.
	it("dedupes by article source, preserving the entry id", () => {
		const { result } = renderHook(makeHook());
		act(() =>
			result.current.upsert({
				source: source("https://a.com"),
				label: "first",
			}),
		);
		const originalId = result.current.history[0]!.id;
		act(() =>
			result.current.upsert({
				source: source("https://a.com"),
				label: "second",
			}),
		);
		expect(result.current.history).toHaveLength(1);
		expect(result.current.history[0]).toMatchObject({
			id: originalId,
			label: "second",
		});
	});

	it("caps the history at maxHistory, dropping the oldest", () => {
		const { result } = renderHook(makeHook(2));
		for (const n of [1, 2, 3]) {
			act(() =>
				result.current.upsert({
					source: source(`https://site${n}.com`),
					label: `${n}`,
				}),
			);
		}
		expect(result.current.history.map((e) => e.label)).toEqual(["3", "2"]);
	});

	it("removes a single entry by id", () => {
		const { result } = renderHook(makeHook());
		act(() =>
			result.current.upsert({ source: source("https://a.com"), label: "A" }),
		);
		const id = result.current.history[0]!.id;
		act(() => result.current.remove(id));
		expect(result.current.history).toEqual([]);
	});

	it("clears everything", () => {
		const { result } = renderHook(makeHook());
		act(() =>
			result.current.upsert({ source: source("https://a.com"), label: "A" }),
		);
		act(() => result.current.clear());
		expect(result.current.history).toEqual([]);
	});

	it("persists to localStorage under the tool's namespaced key", () => {
		const hook = createToolHistory<Entry>({ key: "tbt:test:persist", isEntry });
		const { result } = renderHook(hook);
		act(() =>
			result.current.upsert({ source: source("https://a.com"), label: "A" }),
		);
		const raw = window.localStorage.getItem("tbt:test:persist");
		expect(raw).not.toBeNull();
		expect(JSON.parse(raw!)).toHaveLength(1);
	});
});
