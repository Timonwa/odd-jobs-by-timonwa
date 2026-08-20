import { siteConfig } from "@/lib/config/site";

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
});

/** Visible author and date for a post or issue. The JSON-LD on these pages asserts `author`, `datePublished`, and `dateModified`, so the page needs to show what it claims — and a `<time datetime>` is what makes the date machine-readable. */
export function ContentByline({
	publishedAt,
	updatedAt,
	readingMinutes,
}: {
	publishedAt: string;
	updatedAt?: string;
	readingMinutes?: number;
}) {
	const updated =
		updatedAt && updatedAt !== publishedAt ? updatedAt : undefined;
	return (
		<p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
			<span>
				By{" "}
				<span className="font-medium text-foreground">
					{siteConfig.creator.name}
				</span>
			</span>
			<span aria-hidden>·</span>
			<time dateTime={publishedAt}>
				{DATE_FORMAT.format(new Date(publishedAt))}
			</time>
			{updated && (
				<>
					<span aria-hidden>·</span>
					<span>
						Updated{" "}
						<time dateTime={updated}>
							{DATE_FORMAT.format(new Date(updated))}
						</time>
					</span>
				</>
			)}
			{readingMinutes != null && (
				<>
					<span aria-hidden>·</span>
					<span>{readingMinutes} min read</span>
				</>
			)}
		</p>
	);
}
