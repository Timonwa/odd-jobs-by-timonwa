"use server";
// Server action for the newsletter signup form — validates and meters here, then
// forwards to the signup endpoint.

import { z } from "zod";

import { siteConfig } from "@/lib/config/site";
import {
	NEWSLETTER_BURST_CAP,
	NEWSLETTER_DAILY_SHARED_POOL,
	NEWSLETTER_DAILY_USER_CAP,
	NEWSLETTER_HONEYPOT_FIELD,
	NEWSLETTER_SUBSCRIBE_ENDPOINT,
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

/** Server action — validate and submit an email address to the newsletter list. */
export async function subscribeNewsletter(
	_prevState: NewsletterFormState,
	formData: FormData,
): Promise<NewsletterFormState> {
	// Hidden field a person never sees, so a value here is not a real submission.
	// Answered like a success; a real user cannot reach this branch.
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

	// Unauthenticated write to a third-party list, so it is metered like the AI tools.
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

	try {
		const response = await fetch(NEWSLETTER_SUBSCRIBE_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Origin: siteConfig.url,
			},
			body: JSON.stringify({ email: parsed.data }),
			signal: AbortSignal.timeout(10_000),
		});

		const body = (await response.json().catch(() => null)) as {
			success?: boolean;
			message?: string;
		} | null;

		if (response.ok && body?.success) {
			return { status: "success", message: SIGNUP_CONFIRMATION };
		}

		console.error(
			`[newsletter] subscribe endpoint responded ${response.status}`,
			body?.message ?? "",
		);
		return {
			status: "error",
			message:
				"Something went wrong signing you up. Please try again in a moment.",
		};
	} catch (error) {
		console.error("[newsletter] subscribe request failed", error);
		return {
			status: "error",
			message:
				"We couldn't reach the newsletter service. Please try again in a moment.",
		};
	}
}
