"use client";

import { ErrorContent } from "@/components/errors/error";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return <ErrorContent error={error} reset={reset} />;
}
