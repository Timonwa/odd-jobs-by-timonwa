import Link from "next/link";

import { HubNavbar } from "@/components/_shared/layout";
import { buttonClasses } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { NAV_PILLARS } from "@/lib/constants";

type NotFoundContentProps = { withNavbar?: boolean };

/** The 404 body. `withNavbar` is false inside the `(hub)` group, whose layout already renders one — rendering both stacked two navbars on every content 404. */
export function NotFoundContent({ withNavbar = true }: NotFoundContentProps) {
	return (
		<>
			{withNavbar && <HubNavbar />}
			<main className="container mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
				<p className="text-sm font-medium uppercase tracking-wide text-primary">
					404
				</p>
				<h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
					Page not found
				</h1>
				<p className="mt-3 text-muted-foreground">
					This page doesn&apos;t exist, or it moved. Everything else is still
					where you left it.
				</p>
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Link href={ROUTES.home} className={buttonClasses({ size: "lg" })}>
						Back to home
					</Link>
					<Link
						href={ROUTES.tools}
						className={buttonClasses({ variant: "outline", size: "lg" })}
					>
						Browse the tools
					</Link>
				</div>
				<p className="mt-10 text-sm text-muted-foreground">
					Or pick a section:
				</p>
				{/* From NAV_PILLARS, so a new section reaches this page automatically. */}
				<ul className="mt-3 flex flex-wrap justify-center gap-2">
					{NAV_PILLARS.map((pillar) => (
						<li key={pillar.label}>
							<Link
								href={pillar.href}
								className={buttonClasses({ variant: "outline", size: "sm" })}
							>
								{pillar.label}
							</Link>
						</li>
					))}
				</ul>
			</main>
		</>
	);
}
