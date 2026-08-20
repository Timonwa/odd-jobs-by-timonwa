import { MailIcon } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/lib/config/routes";

export function IssuePageFooter() {
	return (
		<footer className="mt-16 border-t border-border/60 pt-8">
			<Link
				href={ROUTES.newsletter}
				className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
			>
				<MailIcon aria-hidden className="h-4 w-4" />
				Browse all issues
			</Link>
		</footer>
	);
}
