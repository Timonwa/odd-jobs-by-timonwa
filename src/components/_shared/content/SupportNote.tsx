import { EXTERNAL_ROUTES } from "@/lib/config/routes";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

/** One-line support ask, for the end of something the reader just got for free. */
export function SupportNote({
	lead,
	className,
}: {
	/** Sentence before the link, tuned to what just finished. */
	lead: string;
	className?: string;
}) {
	return (
		<p className={cn("text-sm text-muted-foreground", className)}>
			{lead}{" "}
			<a
				href={EXTERNAL_ROUTES.support}
				target="_blank"
				rel="noopener noreferrer"
				className="font-medium text-primary hover:underline"
			>
				Support {siteConfig.name}
			</a>
		</p>
	);
}
