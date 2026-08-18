"use client";

import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { OPEN_BYOK_EVENT } from "@/lib/constants";
import { cn, subscribeHostedUsage } from "@/lib/utils";
type HostedUsagePillProps = {
	perUserDaily: number;
	getUsage: () => Promise<{ configured: boolean }>;
};

// Below this many left, the pill switches to a warning tone and nudges toward BYOK.
const LOW_REMAINING = 2;

/** A hosted-usage pill shown once the daily quota is confirmed — starts as the "N free/day" cap, then updates in place to "X of N left" after each run (`getUsage` runs from an effect, not `use()`, to avoid a waterfall). */
export function HostedUsagePill({
	perUserDaily,
	getUsage,
}: HostedUsagePillProps) {
	const [configured, setConfigured] = useState<boolean | null>(null);
	const [remaining, setRemaining] = useState<number | null>(null);

	useEffect(() => {
		let cancelled = false;
		getUsage()
			.then((u) => {
				if (!cancelled) setConfigured(u.configured);
			})
			.catch(() => {
				if (!cancelled) setConfigured(false);
			});
		return () => {
			cancelled = true;
		};
	}, [getUsage]);

	useEffect(() => subscribeHostedUsage(setRemaining), []);

	if (!configured) return null;

	const low = remaining != null && remaining <= LOW_REMAINING;
	const label =
		remaining == null
			? `${perUserDaily} free/day`
			: `${remaining} of ${perUserDaily} left`;
	const summary =
		remaining == null
			? `${perUserDaily} free generations per person per day. Click to add your own Gemini key for unlimited use.`
			: low
				? `${remaining} of ${perUserDaily} free generations left today — they reset tomorrow. Click to add your own Gemini key and skip the limit.`
				: `${remaining} of ${perUserDaily} free generations left today. Click to add your own Gemini key for unlimited use.`;
	const Icon = low ? TriangleAlertIcon : InfoIcon;

	const openByok = () => {
		window.dispatchEvent(new Event(OPEN_BYOK_EVENT));
	};

	return (
		<div className="group relative inline-flex">
			<button
				type="button"
				onClick={openByok}
				aria-label={remaining == null ? "Add your own Gemini key" : summary}
				className={cn(
					"inline-flex items-center gap-1.5 rounded-full border transition-colors px-2.5 py-1 text-[10px] leading-tight sm:text-xs whitespace-nowrap cursor-pointer",
					low
						? "border-tint-2/40 bg-tint-2/10 text-tint-2 hover:bg-tint-2/20"
						: "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:border-primary/40",
				)}
			>
				<Icon aria-hidden className="w-3 h-3 shrink-0 opacity-70" />
				<span
					className={cn(
						"tabular-nums",
						low ? "font-medium" : "text-foreground/90",
					)}
				>
					{label}
				</span>
			</button>
			<span
				role="tooltip"
				className="text-center pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max max-w-[min(16rem,calc(100vw-1rem))] -translate-x-1/2 rounded-md border border-border/60 bg-popover/75 backdrop-blur-md px-2.5 py-1.5 text-[11px] leading-snug text-popover-foreground shadow-md opacity-0 translate-y-2 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
			>
				{summary}
			</span>
		</div>
	);
}
