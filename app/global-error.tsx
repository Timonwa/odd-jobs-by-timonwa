"use client";

import { GlobalErrorContent } from "@/components/errors/GlobalErrorContent";
import "../src/styles/globals.css";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body className="antialiased">
				<GlobalErrorContent error={error} reset={reset} />
			</body>
		</html>
	);
}
