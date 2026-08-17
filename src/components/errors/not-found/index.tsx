import Link from "next/link";

import { HubNavbar } from "@/components/_shared/layout";
import { buttonClasses } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";

export function NotFoundContent() {
	return (
		<>
			<HubNavbar />
			<main className="container mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
				<p className="text-sm font-medium uppercase tracking-wide text-primary">
					404
				</p>
				<h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
					Page not found
				</h1>
				<p className="mt-3 text-muted-foreground">
					The page you&apos;re looking for doesn&apos;t exist or has moved.
				</p>
				<Link
					href={ROUTES.home}
					className={buttonClasses({ size: "lg", className: "mt-8" })}
				>
					Back to home
				</Link>
			</main>
		</>
	);
}
