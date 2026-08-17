import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { ToolGrid } from "@/components/_shared/tool/ToolGrid";
import { buttonClasses } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { FEATURED_TOOLS, LIVE_TOOLS } from "@/lib/config/tools";

export function ToolsPreview() {
	const hasMore = LIVE_TOOLS.length > FEATURED_TOOLS.length;

	return (
		<section aria-labelledby="tools-heading" className="flex flex-col gap-6">
			<div className="flex items-center justify-between gap-4">
				<h2
					id="tools-heading"
					className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
				>
					Featured tools
				</h2>
				<Link
					href={ROUTES.tools}
					className={buttonClasses({ variant: "outline", size: "sm" })}
				>
					View all tools
					<ArrowRightIcon aria-hidden className="h-4 w-4" />
				</Link>
			</div>

			<ToolGrid tools={FEATURED_TOOLS} />

			{hasMore && (
				<div className="flex justify-center pt-2">
					<Link
						href={ROUTES.tools}
						className={buttonClasses({ variant: "outline" })}
					>
						Browse all {LIVE_TOOLS.length} tools
						<ArrowRightIcon aria-hidden className="h-4 w-4" />
					</Link>
				</div>
			)}
		</section>
	);
}
