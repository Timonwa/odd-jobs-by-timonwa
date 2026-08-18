import type { ReactNode } from "react";

import { MAIN_CONTENT_ID } from "../PageMain";

/** The root page shell — a full-height column with the content growing and the footer slotted at the bottom. */
export function SiteLayout({
	children,
	footer,
}: {
	children: ReactNode;
	footer?: ReactNode;
}) {
	return (
		<div className="flex min-h-screen flex-col">
			{/* First tab stop on every page. Eight-plus header controls preceded the
			    content before this existed (WCAG 2.4.1). Visible only on focus. */}
			<a
				href={`#${MAIN_CONTENT_ID}`}
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-primary"
			>
				Skip to main content
			</a>
			<div className="flex-1">{children}</div>
			{footer}
		</div>
	);
}
