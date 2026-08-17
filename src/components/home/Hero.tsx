import { WrenchIcon } from "lucide-react";

import { PageHero } from "@/components/ui";

export function Hero() {
	return (
		<div className="relative isolate py-10 sm:py-16">
			{/* Full-bleed ambient wash — breaks out of the max-w container to span the viewport (the root clips any overflow); blurred so it fades with no hard edges. */}
			<div
				aria-hidden
				className="pointer-events-none absolute -top-16 left-1/2 -z-10 w-screen -translate-x-1/2"
			>
				<div className="h-72 w-full rounded-full bg-linear-to-r from-tint-3/25 via-primary/20 to-tint-1/25 opacity-70 blur-[100px]" />
			</div>

			<PageHero
				className="mb-12 sm:mb-16"
				eyebrow={{ icon: WrenchIcon, label: "Open source · no sign-up" }}
				title={
					<>
						Free tools that{" "}
						<span className="hero-gradient-text">get it done</span>
					</>
				}
				subtitle={
					<>
						Free, focused tools that knock out the tedious parts of writing and
						code — turn an article into social posts, convert an SVG to JSX,
						size up SEO titles, generate a slug. No sign-up, nothing to install.
					</>
				}
			/>
		</div>
	);
}
