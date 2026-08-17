import type { Route } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export type IssueNavType = { href: Route; title: string } | null;

const CARD =
	"group flex flex-col gap-1 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:-translate-y-0.5";
const LABEL =
	"flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground";

/** Previous / next navigation between newsletter issues. */
export default function IssuePrevNext({
	prev,
	next,
}: {
	prev: IssueNavType;
	next: IssueNavType;
}) {
	if (!prev && !next) return null;

	return (
		<nav
			aria-label="More issues"
			className="mt-16 grid gap-4 border-t border-border/60 pt-10 sm:grid-cols-2"
		>
			{prev ? (
				<Link href={prev.href} className={CARD}>
					<span className={LABEL}>
						<ArrowLeftIcon aria-hidden className="h-3.5 w-3.5" />
						Previous issue
					</span>
					<span className="text-sm font-semibold">{prev.title}</span>
				</Link>
			) : (
				<span aria-hidden />
			)}
			{next ? (
				<Link href={next.href} className={`${CARD} text-right sm:items-end`}>
					<span className={LABEL}>
						Next issue
						<ArrowRightIcon aria-hidden className="h-3.5 w-3.5" />
					</span>
					<span className="text-sm font-semibold">{next.title}</span>
				</Link>
			) : (
				<span aria-hidden />
			)}
		</nav>
	);
}
