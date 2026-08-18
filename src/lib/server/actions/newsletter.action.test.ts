import { beforeEach, describe, expect, it, vi } from "vitest";

import { NEWSLETTER_HONEYPOT_FIELD } from "@/lib/constants";

const checkAndIncrementQuota = vi.fn();
vi.mock("@/lib/server/utils/rate-limit.utils", () => ({
	checkAndIncrementQuota: (config: unknown) => checkAndIncrementQuota(config),
}));

// The action reads env.SENDER_API_TOKEN at module load — `vi.hoisted` runs
// before the hoisted static imports, unlike a top-level `vi.stubEnv`.
vi.hoisted(() => {
	process.env.SENDER_API_TOKEN = "test-sender-token";
});

import { subscribeNewsletter } from "./newsletter.action";

const IDLE = { status: "idle" } as const;

const form = (fields: Record<string, string>) => {
	const data = new FormData();
	for (const [name, value] of Object.entries(fields)) data.append(name, value);
	return data;
};

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

beforeEach(() => {
	vi.spyOn(console, "error").mockImplementation(() => {});
	vi.spyOn(console, "warn").mockImplementation(() => {});
	checkAndIncrementQuota
		.mockReset()
		.mockResolvedValue({ allowed: true, remaining: 4 });
	fetchMock.mockReset().mockResolvedValue(new Response("{}", { status: 200 }));
});

describe("subscribeNewsletter", () => {
	it("subscribes a valid address through Sender.net", async () => {
		const state = await subscribeNewsletter(IDLE, form({ email: "a@b.com" }));
		expect(state.status).toBe("success");
		expect(fetchMock).toHaveBeenCalledOnce();
		const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(JSON.parse(String(init.body))).toMatchObject({ email: "a@b.com" });
	});

	// A filled honeypot is automation — answer success so the bot doesn't learn
	// it was blocked, and write nothing anywhere.
	it("silently drops a submission with a filled honeypot", async () => {
		const state = await subscribeNewsletter(
			IDLE,
			form({ email: "bot@spam.com", [NEWSLETTER_HONEYPOT_FIELD]: "gotcha" }),
		);
		expect(state.status).toBe("success");
		expect(fetchMock).not.toHaveBeenCalled();
		expect(checkAndIncrementQuota).not.toHaveBeenCalled();
	});

	it("rejects an invalid email before metering or fetching", async () => {
		const state = await subscribeNewsletter(
			IDLE,
			form({ email: "not-an-email" }),
		);
		expect(state).toEqual({
			status: "error",
			message: "Enter a valid email address.",
		});
		expect(checkAndIncrementQuota).not.toHaveBeenCalled();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	// The action writes to a third-party list with the server token, so it is
	// metered like the AI tools — a denial must stop the write.
	it.each(["user", "pool", "burst"] as const)(
		"refuses without writing when the %s quota denies",
		async (reason) => {
			checkAndIncrementQuota.mockResolvedValue({ allowed: false, reason });
			const state = await subscribeNewsletter(IDLE, form({ email: "a@b.com" }));
			expect(state.status).toBe("error");
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it("fails closed when metering is unavailable", async () => {
		checkAndIncrementQuota.mockResolvedValue({
			allowed: false,
			reason: "unavailable",
		});
		const state = await subscribeNewsletter(IDLE, form({ email: "a@b.com" }));
		expect(state).toEqual({
			status: "error",
			message: expect.stringContaining("isn't available right now"),
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	// Distinguishing "already subscribed" from "subscribed" made the form a
	// membership oracle — both must return the identical message.
	it("answers already-subscribed identically to a fresh signup", async () => {
		const fresh = await subscribeNewsletter(IDLE, form({ email: "a@b.com" }));
		fetchMock.mockResolvedValue(
			new Response("email already exists", { status: 422 }),
		);
		const repeat = await subscribeNewsletter(IDLE, form({ email: "a@b.com" }));
		expect(repeat).toEqual(fresh);
	});

	it("maps a Sender.net failure to a safe user message", async () => {
		fetchMock.mockResolvedValue(new Response("boom", { status: 500 }));
		const state = await subscribeNewsletter(IDLE, form({ email: "a@b.com" }));
		expect(state.status).toBe("error");
		expect(state.message).not.toContain("boom");
	});

	it("maps a network failure to a safe user message", async () => {
		fetchMock.mockRejectedValue(new Error("ECONNREFUSED sender.internal"));
		const state = await subscribeNewsletter(IDLE, form({ email: "a@b.com" }));
		expect(state.status).toBe("error");
		expect(state.message).not.toContain("ECONNREFUSED");
	});
});
