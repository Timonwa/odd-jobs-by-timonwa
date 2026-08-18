import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { COPY_FEEDBACK_MS } from "@/lib/constants";

import { useCopyFeedback } from "./use-copy-feedback";

const writeText = vi.fn();

beforeEach(() => {
	vi.useFakeTimers();
	writeText.mockReset().mockResolvedValue(undefined);
	Object.assign(navigator, { clipboard: { writeText } });
});

afterEach(() => {
	vi.useRealTimers();
});

describe("useCopyFeedback", () => {
	it("writes to the clipboard and flags the key as copied", async () => {
		const { result } = renderHook(() => useCopyFeedback());
		await act(async () => {
			await expect(result.current.copy("hello")).resolves.toBe(true);
		});
		expect(writeText).toHaveBeenCalledWith("hello");
		expect(result.current.isCopied()).toBe(true);
	});

	it("clears the feedback after the timeout", async () => {
		const { result } = renderHook(() => useCopyFeedback());
		await act(async () => {
			await result.current.copy("hello");
		});
		act(() => vi.advanceTimersByTime(COPY_FEEDBACK_MS));
		expect(result.current.isCopied()).toBe(false);
	});

	it("keys feedback per row so lists highlight the right one", async () => {
		const { result } = renderHook(() => useCopyFeedback());
		await act(async () => {
			await result.current.copy("a", "row-1");
		});
		expect(result.current.isCopied("row-1")).toBe(true);
		expect(result.current.isCopied("row-2")).toBe(false);
	});

	it("does not cut a second copy's feedback short with the first timer", async () => {
		const { result } = renderHook(() => useCopyFeedback());
		await act(async () => {
			await result.current.copy("a", "row-1");
		});
		act(() => vi.advanceTimersByTime(COPY_FEEDBACK_MS / 2));
		await act(async () => {
			await result.current.copy("b", "row-2");
		});
		act(() => vi.advanceTimersByTime(COPY_FEEDBACK_MS / 2));
		expect(result.current.isCopied("row-2")).toBe(true);
	});

	// The clipboard is blocked in insecure contexts — the UI must not claim
	// "Copied" with nothing on the clipboard.
	it("reports a blocked write and shows no feedback", async () => {
		writeText.mockRejectedValue(new Error("NotAllowedError"));
		const { result } = renderHook(() => useCopyFeedback());
		await act(async () => {
			await expect(result.current.copy("hello")).resolves.toBe(false);
		});
		expect(result.current.isCopied()).toBe(false);
	});
});
