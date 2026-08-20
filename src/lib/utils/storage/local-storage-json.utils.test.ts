import { beforeEach, describe, expect, it } from "vitest";

import { createLocalStorageJson } from "./local-storage-json.utils";

type Item = { id: string };
const isItem = (v: unknown): v is Item =>
	!!v && typeof v === "object" && typeof (v as Item).id === "string";

const store = createLocalStorageJson<Item>("tbt:test:items", isItem);

beforeEach(() => {
	window.localStorage.clear();
});

describe("createLocalStorageJson", () => {
	it("round-trips a list", () => {
		store.save([{ id: "a" }, { id: "b" }]);
		expect(store.load()).toEqual([{ id: "a" }, { id: "b" }]);
	});

	it("returns an empty list when nothing is stored", () => {
		expect(store.load()).toEqual([]);
	});

	// A corrupt or hand-edited entry must never crash a tool.
	it("returns an empty list for corrupt JSON", () => {
		window.localStorage.setItem("tbt:test:items", "{not json");
		expect(store.load()).toEqual([]);
	});

	it("returns an empty list for a non-array value", () => {
		window.localStorage.setItem("tbt:test:items", '{"id":"a"}');
		expect(store.load()).toEqual([]);
	});

	it("filters entries the guard rejects", () => {
		window.localStorage.setItem(
			"tbt:test:items",
			'[{"id":"a"},{"evil":true},null,42]',
		);
		expect(store.load()).toEqual([{ id: "a" }]);
	});
});
