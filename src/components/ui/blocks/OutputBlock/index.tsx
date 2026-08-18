import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type OutputBlockProps = HTMLAttributes<HTMLElement> & {
	as?: ElementType;
};

const BASE =
	"rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-sm break-all";

/** A read-only monospace surface for generated output (hashes, slugs, snippets); pass `as` to keep semantics. */
export function OutputBlock({
	as: Tag = "div",
	className,
	...props
}: OutputBlockProps) {
	return <Tag className={cn(BASE, className)} {...props} />;
}
