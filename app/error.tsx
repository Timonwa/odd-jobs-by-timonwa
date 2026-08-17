"use client";

import { useEffect } from "react";

import { HubNavbar } from "@/components/layout/HubNavbar";
import { Button } from "@/components/ui";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<>
			<HubNavbar />
			<main className="container mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
				<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
					Something went wrong
				</h1>
				<p className="mt-3 text-muted-foreground">
					An unexpected error occurred. You can try again — if it keeps
					happening, please report it.
				</p>
				<Button size="lg" className="mt-8" onClick={reset}>
					Try again
				</Button>
			</main>
		</>
	);
}
