import type { ReactNode } from "react";

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
			<div className="flex-1">{children}</div>
			{footer}
		</div>
	);
}
