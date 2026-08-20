/** Announces the state of a long-running generation to assistive tech. Visually hidden — the button label and results already show sighted users what happened, but nothing was announced before this existed (WCAG 4.1.3). */
export function GenerationStatus({
	isGenerating,
	error,
	hasResult,
	subject = "posts",
}: {
	isGenerating: boolean;
	error?: string | null;
	hasResult?: boolean;
	/** What is being generated, for the message: "Generating posts…". */
	subject?: string;
}) {
	const message = isGenerating
		? `Generating ${subject}. This usually takes a few seconds.`
		: error
			? `Generation failed. ${error}`
			: hasResult
				? `Your ${subject} are ready.`
				: "";

	return (
		// `polite` so it waits for a pause rather than interrupting, and
		// `aria-atomic` so the whole sentence is re-read rather than a diff.
		<p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
			{message}
		</p>
	);
}
