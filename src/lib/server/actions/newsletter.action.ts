"use server";
// Server action for the newsletter signup form — validates and submits an email to the subscriber list.

import { z } from "zod";
import { env } from "@env";

import { SENDER_GROUP_IDS, SENDER_SUBSCRIBERS_URL } from "@/lib/config/site";
import {
	NEWSLETTER_BURST_CAP,
	NEWSLETTER_DAILY_SHARED_POOL,
	NEWSLETTER_DAILY_USER_CAP,
	NEWSLETTER_HONEYPOT_FIELD,
} from "@/lib/constants";
import { checkAndIncrementQuota } from "@/lib/server/utils/rate-limit.utils";

// One message for "subscribed" and "already subscribed". Distinguishing them
// turned the form into a membership oracle: anyone could test whether an address
// was on the list by submitting it.
const SIGNUP_CONFIRMATION =
	"You're on the list — expect new tools, posts, and the occasional issue.";

const EmailSchema = z.email();

/** Newsletter form state (React useActionState) — submit status plus a message to show the user. */
export type NewsletterFormState = {
	status: "idle" | "success" | "error";
	message?: string;
};

/** Server action — validate and submit an email address to the Sender.net subscriber list. */
export async function subscribeNewsletter(
	_prevState: NewsletterFormState,
	formData: FormData,
): Promise<NewsletterFormState> {
	// Honeypot: hidden from humans, so anything in it is automation. Answer with
	// the success message rather than an error — a bot that learns it was blocked
	// adapts, and a real user can never reach this branch.
	const honeypot = formData.get(NEWSLETTER_HONEYPOT_FIELD);
	if (typeof honeypot === "string" && honeypot.trim() !== "") {
		return { status: "success", message: SIGNUP_CONFIRMATION };
	}

	const raw = formData.get("email");
	const email = typeof raw === "string" ? raw.trim() : "";

	const parsed = EmailSchema.safeParse(email);
	if (!parsed.success) {
		return { status: "error", message: "Enter a valid email address." };
	}

	// Unauthenticated write to a third-party list, so it gets the same metering
	// as the AI tools: without it, one loop could poison the subscriber list,
	// subscribe-bomb an arbitrary address, or burn the Sender.net plan's budget.
	const quota = await checkAndIncrementQuota({
		toolSlug: "newsletter",
		perUserDaily: NEWSLETTER_DAILY_USER_CAP,
		perUserBurst: NEWSLETTER_BURST_CAP,
		dailyPool: NEWSLETTER_DAILY_SHARED_POOL,
	});
	if (!quota.allowed) {
		return {
			status: "error",
			message:
				quota.reason === "unavailable"
					? "Sign-up isn't available right now. Please try again later."
					: "That's a few too many attempts. Please try again later.",
		};
	}

	const token = env.SENDER_API_TOKEN;
	if (!token) {
		console.warn(
			"[newsletter] SENDER_API_TOKEN is not set — cannot subscribe.",
		);
		return {
			status: "error",
			message: "Sign-up isn't available right now. Please try again later.",
		};
	}

	try {
		const response = await fetch(SENDER_SUBSCRIBERS_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				email: parsed.data,
				groups: SENDER_GROUP_IDS,
				trigger_automation: false,
			}),
			signal: AbortSignal.timeout(10_000),
		});

		if (response.ok) {
			return { status: "success", message: SIGNUP_CONFIRMATION };
		}

		const detail = await response.text().catch(() => "");
		// Sender returns a validation error when the address is already subscribed
		// — that's a success from the visitor's point of view, and it must be
		// indistinguishable from a fresh signup (see SIGNUP_CONFIRMATION).
		if (/already|taken|exists|subscribed/i.test(detail)) {
			return { status: "success", message: SIGNUP_CONFIRMATION };
		}

		console.error(`[newsletter] Sender responded ${response.status}`, detail);
		return {
			status: "error",
			message:
				"Something went wrong signing you up. Please try again in a moment.",
		};
	} catch (error) {
		console.error("[newsletter] Sender request failed", error);
		return {
			status: "error",
			message:
				"We couldn't reach the newsletter service. Please try again in a moment.",
		};
	}
}
