// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";

import {
	emitHostedUsage,
	subscribeHostedUsage,
} from "./hosted-usage-signal.utils";

describe("hosted usage signal", () => {
	it("broadcasts the remaining allowance to subscribers", () => {
		const onUpdate = vi.fn();
		const unsubscribe = subscribeHostedUsage(onUpdate);
		emitHostedUsage(4);
		expect(onUpdate).toHaveBeenCalledWith(4);
		unsubscribe();
	});

	// BYOK and untracked runs report null — the pill must not update.
	it("stays silent for null (BYOK / untracked) runs", () => {
		const onUpdate = vi.fn();
		const unsubscribe = subscribeHostedUsage(onUpdate);
		emitHostedUsage(null);
		expect(onUpdate).not.toHaveBeenCalled();
		unsubscribe();
	});

	it("stops notifying after unsubscribe", () => {
		const onUpdate = vi.fn();
		subscribeHostedUsage(onUpdate)();
		emitHostedUsage(2);
		expect(onUpdate).not.toHaveBeenCalled();
	});
});
