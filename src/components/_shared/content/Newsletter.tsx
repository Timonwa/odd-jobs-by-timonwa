// The newsletter section's shell — heading, copy, and decoration. A Server
// Component: it renders on nearly every page, and only the form inside it needs
// a client boundary (see NewsletterForm).

import { MailIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { NewsletterForm } from "./NewsletterForm";

/** "Productivity, in your inbox" signup section. */
export function Newsletter({ className }: { className?: string }) {
	return (
		<section
			aria-labelledby="newsletter-heading"
			className={cn(
				"relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/15 via-card to-card px-6 py-10 text-center sm:px-10",
				className,
			)}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-tint-1/15 blur-3xl"
			/>
			<div className="relative">
				<span
					aria-hidden
					className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-sm"
				>
					<MailIcon className="h-6 w-6" />
				</span>
				<h2
					id="newsletter-heading"
					className="text-2xl font-semibold tracking-tight"
				>
					Productivity, in your inbox
				</h2>
				<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
					New tools, posts, and the occasional newsletter issue — no spam,
					unsubscribe anytime.
				</p>

				<NewsletterForm />
			</div>
		</section>
	);
}
