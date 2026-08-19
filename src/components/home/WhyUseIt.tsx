import {
	Code2Icon,
	GaugeIcon,
	RulerIcon,
	ShieldCheckIcon,
	SparklesIcon,
	SproutIcon,
} from "lucide-react";

import { IconBadge, Section, SectionHeader } from "@/components/ui";
import { TINT_BORDER, type Tint } from "@/lib/config/tints";
import { cn } from "@/lib/utils";

type Feature = {
	icon: typeof ShieldCheckIcon;
	title: string;
	body: string;
	big?: boolean;
	tint?: Tint;
};

const FEATURES: Feature[] = [
	{
		icon: ShieldCheckIcon,
		title: "Private by default",
		body: "Your words never touch a server I own. The instant tools run entirely on your machine, and AI requests go straight to Google's Gemini — never stored, never used for training. Your drafts stay yours.",
		big: true,
	},
	{
		icon: SparklesIcon,
		title: "Free, no sign-up",
		body: "Every tool is free, including a daily allowance for the AI ones. No account, no credit card, no trial to expire.",
		tint: 4,
	},
	{
		icon: RulerIcon,
		title: "Built to spec",
		body: "Character counts and platform limits are built in, so what comes out already fits X, LinkedIn, and Google.",
		tint: 1,
	},
	{
		icon: GaugeIcon,
		title: "Instant",
		body: "Nothing to install, no page reloads. Results appear as you type, or in one request.",
		tint: 2,
	},
	{
		icon: Code2Icon,
		title: "Open source",
		body: "Built in the open, AGPL-licensed. Read the code, file an issue, or bring your own API key.",
		tint: 3,
	},
	{
		icon: SproutIcon,
		title: "Growing collection",
		body: "New tools, posts, and templates land as I build them. This is the early version of something bigger.",
		tint: 5,
	},
];

export function WhyUseIt() {
	return (
		<Section aria-labelledby="why-heading">
			<SectionHeader
				id="why-heading"
				title="Why use it"
				subtitle="No accounts, no uploads, no catch."
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
