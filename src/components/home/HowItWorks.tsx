import {
	ArrowDownIcon,
	ArrowRightIcon,
	ClipboardPasteIcon,
	CopyCheckIcon,
	MousePointerClickIcon,
} from "lucide-react";

import { IconBadge, Section, SectionHeader } from "@/components/ui";
import { TINT_TEXT, type TintType } from "@/lib/config/tints";
import { cn } from "@/lib/utils";

const STEPS: {
	icon: typeof MousePointerClickIcon;
	title: string;
	body: string;
	tint: TintType;
}[] = [
	{
		icon: MousePointerClickIcon,
		title: "Pick a tool",
		body: "Choose from the collection — an AI writing helper or an instant text tool.",
		tint: 3,
	},
	{
		icon: ClipboardPasteIcon,
		title: "Paste or type",
		body: "Drop in your article, a URL, or any text. No account, no upload, no waiting.",
		tint: 1,
	},
	{
		icon: CopyCheckIcon,
		title: "Copy the result",
		body: "Grab the output — meta tags, posts, counts, or clean text — and get back to work.",
		tint: 4,
	},
];

export function HowItWorks() {
	return (
		<Section aria-labelledby="how-heading">
			<SectionHeader
				id="how-heading"
				title="How it works"
				subtitle="Three steps, a few seconds — nothing to set up."
			/>
			<ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
				{STEPS.map((step, i) => (
					<li
						key={step.title}
						className="relative rounded-xl border border-border bg-card p-6"
					>
						{i < STEPS.length - 1 && (
							<span
								aria-hidden
								className="absolute -bottom-6 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm sm:left-auto sm:right-0 sm:bottom-auto sm:top-12 sm:translate-x-1/2 sm:-translate-y-1/2"
							>
								<ArrowDownIcon className="h-4 w-4 sm:hidden" />
								<ArrowRightIcon className="hidden h-4 w-4 sm:block" />
							</span>
						)}

						<span
							aria-hidden
							className="pointer-events-none absolute right-4 top-2 select-none text-6xl font-bold leading-none text-foreground/4"
						>
							{i + 1}
						</span>

						<div className="relative">
							<IconBadge icon={step.icon} tint={step.tint} size="lg" />
							<p
								className={cn(
									"mt-4 text-xs font-semibold uppercase tracking-wide",
									TINT_TEXT[step.tint],
								)}
							>
								Step {i + 1}
							</p>
							<h3 className="mt-1 text-base font-semibold">{step.title}</h3>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{step.body}
							</p>
						</div>
					</li>
				))}
			</ol>
		</Section>
	);
}
