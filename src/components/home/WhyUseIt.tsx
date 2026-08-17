import {
	Code2Icon,
	GaugeIcon,
	RulerIcon,
	ShieldCheckIcon,
	SparklesIcon,
	SproutIcon,
} from "lucide-react";

import { IconBadge, Section, SectionHeader } from "@/components/ui";
import { TINT_BORDER, type TintType } from "@/lib/config/tints";
import { cn } from "@/lib/utils";

type FeatureType = {
	icon: typeof ShieldCheckIcon;
	title: string;
	body: string;
	big?: boolean;
	tint?: TintType;
};

const FEATURES: FeatureType[] = [
	{
		icon: ShieldCheckIcon,
		title: "Private by default",
		body: "The instant tools run right in your browser — nothing is uploaded. AI requests go straight to Google, and are never stored or used for training. Your drafts stay yours.",
		big: true,
	},
	{
		icon: SparklesIcon,
		title: "Free, no signup",
		body: "Every tool is free with a daily AI allowance. No account, no credit card.",
		tint: 4,
	},
	{
		icon: RulerIcon,
		title: "Built to spec",
		body: "Character counts and platform limits are baked in, so output fits SEO and social.",
		tint: 1,
	},
	{
		icon: GaugeIcon,
		title: "Instant",
		body: "No installs, no page reloads — results appear as you type or in one request.",
		tint: 2,
	},
	{
		icon: Code2Icon,
		title: "Open source",
		body: "Open source and built in the open. Read the code or bring your own key.",
		tint: 3,
	},
	{
		icon: SproutIcon,
		title: "Growing collection",
		body: "New writing, developer, and publishing tools ship regularly — just getting started.",
		tint: 5,
	},
];

export function WhyUseIt() {
	return (
		<Section aria-labelledby="why-heading">
			<SectionHeader
				id="why-heading"
				title="Why use it"
				subtitle="Focused, fast, and respectful of your privacy."
			/>
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{FEATURES.map((feature) => {
					const Icon = feature.icon;

					if (feature.big) {
						return (
							<li
								key={feature.title}
								className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/15 via-primary/5 to-card p-6 sm:col-span-2 sm:p-8 lg:row-span-2"
							>
								<div
									aria-hidden
									className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
								/>
								<div className="relative">
									<span
										aria-hidden
										className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary"
									>
										<Icon className="h-6 w-6" />
									</span>
									<h3 className="mt-5 text-xl font-semibold">
										{feature.title}
									</h3>
									<p className="mt-2 max-w-md leading-relaxed text-muted-foreground">
										{feature.body}
									</p>
								</div>
							</li>
						);
					}

					return (
						<li
							key={feature.title}
							className={cn(
								"rounded-xl border bg-card p-5",
								feature.tint && TINT_BORDER[feature.tint],
							)}
						>
							<IconBadge icon={Icon} tint={feature.tint} />
							<h3 className="mt-4 font-semibold">{feature.title}</h3>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{feature.body}
							</p>
						</li>
					);
				})}
			</ul>
		</Section>
	);
}
