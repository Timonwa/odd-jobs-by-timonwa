import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** A marketing content section — shared vertical rhythm, max width, and column stack; pair with `SectionHeader`. */
export function Section({
	className,
	...props
}: React.ComponentProps<"section">) {
	return <section className={cn("section", className)} {...props} />;
}

type SectionHeaderProps = {
	id?: string;
	eyebrow?: ReactNode;
	title: ReactNode;
	subtitle?: ReactNode;
	className?: string;
};

/** The eyebrow / heading / subtitle block atop a `Section`, using the `.section-*` type styles. */
export function SectionHeader({
	id,
	eyebrow,
	title,
	subtitle,
	className,
}: SectionHeaderProps) {
	return (
		<div className={className}>
			{eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
			<h2 id={id} className="section-heading">
				{title}
			</h2>
			{subtitle && <p className="section-subtitle">{subtitle}</p>}
		</div>
	);
}
