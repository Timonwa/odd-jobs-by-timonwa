"use client";

import { useEffect } from "react";

// Self-contained on purpose: global-error replaces the root layout, so
// globals.css (and the ui/ primitives styled by it) never load here.
export function GlobalErrorContent({
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
		<main
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "0 1rem",
				textAlign: "center",
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<h1 style={{ fontSize: "1.875rem", fontWeight: 700, margin: 0 }}>
				Something went wrong
			</h1>
			<p style={{ marginTop: "0.75rem", color: "#6b7280" }}>
				A critical error occurred. Try reloading the app.
			</p>
			<button
				type="button"
				onClick={reset}
				style={{
					marginTop: "2rem",
					padding: "0.625rem 1.25rem",
					borderRadius: "0.5rem",
					border: "1px solid #d1d5db",
					background: "#111827",
					color: "#fff",
					fontSize: "0.875rem",
					fontWeight: 600,
					cursor: "pointer",
				}}
			>
				Try again
			</button>
		</main>
	);
}
