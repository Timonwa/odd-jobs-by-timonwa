"use client";

import { GlobalErrorContent } from "@/components/errors/global-error";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body>
				<GlobalErrorContent error={error} reset={reset} />
			</body>
		</html>
	);
}
