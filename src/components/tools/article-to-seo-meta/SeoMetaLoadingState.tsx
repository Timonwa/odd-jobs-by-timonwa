import { Card } from "@/components/ui";

/** Skeleton placeholder shown while SEO variations are being generated. */
export function SeoMetaLoadingState() {
	return (
		<div className="flex flex-col gap-4">
			{[0, 1, 2].map((i) => (
				<Card key={i} className="gap-4 p-5 animate-pulse">
					<div className="h-3 w-20 rounded bg-muted" />
					<div className="flex flex-col gap-2">
						<div className="h-3 w-12 rounded bg-muted" />
						<div className="h-4 w-full rounded bg-muted" />
					</div>
					<div className="flex flex-col gap-2">
						<div className="h-3 w-20 rounded bg-muted" />
						<div className="h-4 w-full rounded bg-muted" />
						<div className="h-4 w-4/5 rounded bg-muted" />
					</div>
				</Card>
			))}
		</div>
	);
}
