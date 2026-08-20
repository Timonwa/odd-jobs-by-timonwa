export default function Loading() {
	return (
		<main
			aria-busy="true"
			aria-label="Loading"
			className="container mx-auto flex min-h-[70vh] items-center justify-center px-4"
		>
			<span className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
		</main>
	);
}
