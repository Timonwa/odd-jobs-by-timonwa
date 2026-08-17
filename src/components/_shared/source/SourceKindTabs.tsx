"use client";

import { FileTextIcon, LinkIcon } from "lucide-react";

import type { ArticleSourceKind } from "@/lib/types";
import { cn } from "@/lib/utils";

/** URL / paste-text tab switcher shared by the article-source tools (social posts, SEO meta). */
export function SourceKindTabs({
	value,
	onChange,
	disabled,
	textLabel = "Paste text",
}: {
	value: ArticleSourceKind;
	onChange: (kind: ArticleSourceKind) => void;
	disabled?: boolean;
	textLabel?: string;
}) {
	const tabs: {
		id: ArticleSourceKind;
		label: string;
		icon: typeof LinkIcon;
	}[] = [
		{ id: "url", label: "URL", icon: LinkIcon },
		{ id: "text", label: textLabel, icon: FileTextIcon },
	];
	return (
		<div
			role="tablist"
			aria-label="Source input type"
			className="inline-flex rounded-md border border-border bg-muted/40 p-1 text-sm"
		>
			{tabs.map((t) => {
				const active = value === t.id;
				const Icon = t.icon;
				return (
					<button
						key={t.id}
						type="button"
						role="tab"
						aria-selected={active}
						onClick={() => onChange(t.id)}
						disabled={disabled}
						className={cn(
							"inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
							active
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
							disabled && "opacity-50 cursor-not-allowed",
						)}
					>
						<Icon aria-hidden className="w-3.5 h-3.5" />
						{t.label}
					</button>
				);
			})}
		</div>
	);
}
