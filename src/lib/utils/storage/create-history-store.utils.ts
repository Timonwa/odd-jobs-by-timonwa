"use client";
// Factory for a localStorage-backed, subscribable history store.

import { useCallback, useSyncExternalStore } from "react";

import { createLocalStore } from "./local-store.utils";

/** Factory for a localStorage-backed history hook; each tool provides read/write and an applyUpsert reducer for its dedup rule. */
export function createHistoryStore<
	Entry extends { id: string },
	UpsertInput,
>(opts: {
	read: () => Entry[];
	write: (items: Entry[]) => void;
	applyUpsert: (current: Entry[], input: UpsertInput) => Entry[];
}) {
	const EMPTY: Entry[] = [];
	const store = createLocalStore<Entry[]>({
		read: opts.read,
		write: opts.write,
		serverValue: EMPTY,
	});

	return function useHistory() {
		const history = useSyncExternalStore(
			store.subscribe,
			store.getSnapshot,
			store.getServerSnapshot,
		);

		const upsert = useCallback((input: UpsertInput) => {
			store.set(opts.applyUpsert(store.get(), input));
		}, []);

		const remove = useCallback((id: string) => {
			store.set(store.get().filter((e) => e.id !== id));
		}, []);

		const clear = useCallback(() => store.set(EMPTY), []);

		return { history, upsert, remove, clear };
	};
}
