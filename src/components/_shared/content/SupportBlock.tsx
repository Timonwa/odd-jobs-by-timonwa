// The tools-side counterpart to `Newsletter`: same shell, different ask. A tool
// visitor came to finish a task, so support fits where a signup form doesn't —
// the newsletter stays one line, for the few who do want it.

import { HeartIcon } from "lucide-react";
import Link from "next/link";

import { buttonClasses } from "@/components/ui";
import { EXTERNAL_ROUTES, ROUTES } from "@/lib/config/routes";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

/** Support ask for every page that isn't the blog or newsletter — those ask for a signup instead. */
export function SupportBlock({
	heading = "Found this useful?",
	body = "Every tool here is free, with no ads and no account. If one saved you a few minutes, you can help keep them coming.",
	className,
}: {
	heading?: string;
	/** Override where "every tool here is free" wouldn't be true — the home page, the shop. */
	body?: string;
	className?: string;
}) {
	return (
		<section
			aria-labelledby="support-heading"
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
					<HeartIcon className="h-6 w-6" />
				</span>
				<h2
					id="support-heading"
					className="text-2xl font-semibold tracking-tight"
				>
					{heading}
				</h2>
				<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
					{body}
				</p>

				<div className="mt-6 flex flex-wrap items-center justify-center gap-3">
					<a
						href={EXTERNAL_ROUTES.support}
						target="_blank"
						rel="noopener noreferrer"
						className={buttonClasses({ size: "lg" })}
					>
						Support {siteConfig.name}
					</a>
					<a
						href={EXTERNAL_ROUTES.repo}
						target="_blank"
						rel="noopener noreferrer"
						className={buttonClasses({ variant: "outline", size: "lg" })}
					>
						Star the repo
					</a>
				</div>

				<p className="mt-6 text-sm text-muted-foreground">
					Prefer email?{" "}
					<Link
						href={ROUTES.newsletter}
						className="font-medium text-primary hover:underline"
					>
						Get new tools and guides monthly
					</Link>
					.
				</p>
			</div>
		</section>
	);
}
