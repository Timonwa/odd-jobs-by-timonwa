import { ArrowRightIcon, WrenchIcon } from "lucide-react";
import Link from "next/link";

import { buttonClasses, PageHero } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";

export function HomeHero() {
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
				eyebrow={{ icon: WrenchIcon, label: "Free · no sign-up · open source" }}
				title={
					<>
						The <span className="hero-gradient-text">odd jobs</span> in writing
						and code
					</>
				}
				subtitle={
					<>
						Free tools that each do one of them, plus writing on workflow and
						templates worth keeping.
					</>
				}
				actions={
					<>
						<Link href={ROUTES.tools} className={buttonClasses()}>
							Browse the tools
							<ArrowRightIcon aria-hidden className="h-4 w-4" />
						</Link>
						<Link
							href={ROUTES.blog}
							className={buttonClasses({ variant: "outline" })}
						>
							Read the blog
						</Link>
					</>
				}
			/>
		</div>
	);
}
