import type { ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/utils";
import type { IconComponent } from "@/lib/types";

type PageHeroProps = {
	eyebrow?: { icon?: IconComponent; label: string };
	title: ReactNode;
	subtitle?: ReactNode;
	actions?: ReactNode;
	className?: string;
};

/** Centered page hero — optional shimmer eyebrow pill, a title, a subtitle, and an optional actions row. */
export function PageHero({
	eyebrow,
	title,
	subtitle,
	actions,
	className,
}: PageHeroProps) {
	const headingId = useId();
	const EyebrowIcon = eyebrow?.icon;

	return (
		<section
			aria-labelledby={headingId}
			className={cn("text-center", className)}
		>
			{eyebrow && (
				<p className="relative inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6 overflow-hidden isolate">
					<span
						aria-hidden
						className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
					>
						<span className="absolute top-0 bottom-0 w-[32%] max-w-28 bg-linear-to-r from-transparent via-white/35 to-transparent dark:via-white/14 left-[-32%] motion-safe:animate-[hero-badge-sweep_8s_ease-in-out_infinite]" />
					</span>
					{EyebrowIcon && (
						<EyebrowIcon
							aria-hidden
							className="w-4 h-4 relative z-10 shrink-0"
						/>
					)}
					<span className="text-xs sm:text-sm font-medium relative z-10">
						{eyebrow.label}
					</span>
				</p>
			)}
			<h1
				id={headingId}
				className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight leading-tight"
			>
				{title}
			</h1>
			{subtitle && (
				<p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
					{subtitle}
				</p>
			)}
			{actions && (
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					{actions}
				</div>
			)}
		</section>
	);
}
