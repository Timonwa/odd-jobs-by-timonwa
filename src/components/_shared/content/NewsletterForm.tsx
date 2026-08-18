"use client";
// The only interactive part of the newsletter section: the form, its action
// state, and the success message that replaces it. Split out so the section's
// shell — which renders on nearly every page — stays a Server Component.

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import { Button, Input } from "@/components/ui";
import { NEWSLETTER_HONEYPOT_FIELD } from "@/lib/constants";
import {
	type NewsletterFormState,
	subscribeNewsletter,
} from "@/lib/server/actions";

const INITIAL: NewsletterFormState = { status: "idle" };

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" disabled={pending} className="shrink-0">
			{pending ? "Subscribing…" : "Notify me"}
		</Button>
	);
}

/** Email capture for the newsletter section — posts to the Sender.net server action. */
export function NewsletterForm() {
	const [state, formAction] = useActionState(subscribeNewsletter, INITIAL);
	const emailId = useId();
	const errorId = useId();
	const honeypotId = useId();

	if (state.status === "success") {
		return (
			// Focused on mount: swapping the form out means this region is created
			// with its text already in it, which most screen readers never announce
			// — and the submit button it replaced no longer exists to hold focus.
			<p
				ref={(node) => node?.focus()}
				tabIndex={-1}
				role="status"
				className="mx-auto mt-6 max-w-md rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary"
			>
				{state.message}
			</p>
		);
	}

	return (
		<form action={formAction} className="mx-auto mt-6 max-w-md">
			<div className="flex flex-col gap-2 sm:flex-row">
				<label htmlFor={emailId} className="sr-only">
					Email address
				</label>
				<Input
					id={emailId}
					type="email"
					name="email"
					required
					autoComplete="email"
					inputMode="email"
					placeholder="you@example.com"
					aria-describedby={state.status === "error" ? errorId : undefined}
					className="flex-1"
				/>
				<SubmitButton />
			</div>

			{/* Honeypot — hidden from people and from assistive tech, so anything
			    filled in here is automation. Not `type="hidden"`, which bots skip. */}
			<div aria-hidden className="hidden">
				<label htmlFor={honeypotId}>Company website</label>
				<input
					id={honeypotId}
					type="text"
					name={NEWSLETTER_HONEYPOT_FIELD}
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			{state.status === "error" && (
				<p id={errorId} role="alert" className="mt-2 text-sm text-destructive">
					{state.message}
				</p>
			)}
		</form>
	);
}
