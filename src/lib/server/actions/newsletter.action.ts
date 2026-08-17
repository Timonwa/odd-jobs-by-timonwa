"use server";
// Server action for the newsletter signup form — validates and submits an email to the subscriber list.

import { z } from "zod";
import { env } from "@env";

// Sender.net REST endpoint — requires SENDER_API_TOKEN; missing token surfaces an error to the user rather than silently dropping the address.
const SENDER_API_BASE_URL = "https://api.sender.net/v2/subscribers";

// Groups a new subscriber joins: "All customers" (account-wide) and
// "The Productivity Bug" (this site's list).
const SENDER_GROUP_IDS = ["b6VOlQ", "dw5jLr"];

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
	const raw = formData.get("email");
	const email = typeof raw === "string" ? raw.trim() : "";

	const parsed = EmailSchema.safeParse(email);
	if (!parsed.success) {
		return { status: "error", message: "Enter a valid email address." };
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
		const response = await fetch(SENDER_API_BASE_URL, {
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
			return {
				status: "success",
				message:
					"You're on the list — expect new tools, posts, and the occasional issue.",
			};
		}

		const detail = await response.text().catch(() => "");
		// Sender returns a validation error when the address is already subscribed
		// — that's a success from the visitor's point of view.
		if (/already|taken|exists|subscribed/i.test(detail)) {
			return {
				status: "success",
				message: "You're already on the list — thanks for being here!",
			};
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
