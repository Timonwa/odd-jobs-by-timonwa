"use client";
// Inline editor for a saved template's name.

import { useState } from "react";
import { CheckIcon, RefreshCwIcon, XIcon } from "lucide-react";
import { Button, Input, Tooltip } from "@/components/ui";
import { MAX_SOCIAL_POST_STYLE_TEMPLATE_NAME_CHARS } from "@/lib/constants";
import type { SocialPostStyleTemplate } from "@/lib/types";

export function TemplateEditor({
	template,
	disabled,
	onRename,
	onUpdate,
	onDone,
}: {
	template: SocialPostStyleTemplate;
	disabled?: boolean;
	onRename: (name: string) => void;
	onUpdate: () => void;
	onDone: () => void;
}) {
	const [name, setName] = useState(template.name);
	const rename = () => {
		onRename(name);
		onDone();
	};
	const updateStyle = () => {
		onRename(name);
		onUpdate();
		onDone();
	};
	return (
		<div className="flex flex-col w-full rounded-md border border-primary/40 bg-primary/5 p-2 gap-2">
			<div className="flex items-center gap-1.5">
				<div className="relative min-w-0 flex-1">
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								rename();
							}
							if (e.key === "Escape") {
								e.preventDefault();
								onDone();
							}
						}}
						maxLength={MAX_SOCIAL_POST_STYLE_TEMPLATE_NAME_CHARS}
						disabled={disabled}
						aria-label="Style template name"
						className="h-8 w-full pr-12 text-xs"
					/>
					<span className="pointer-events-none absolute bottom-1 right-2 text-[10px] text-muted-foreground tabular-nums">
						{name.length}/{MAX_SOCIAL_POST_STYLE_TEMPLATE_NAME_CHARS}
					</span>
				</div>
				<Tooltip label="Cancel">
					<Button
						size="sm"
						type="button"
						variant="outline"
						aria-label="Cancel"
						onClick={onDone}
					>
						<XIcon aria-hidden className="w-3.5 h-3.5" />
					</Button>
				</Tooltip>
			</div>
			<div className="flex flex-wrap items-center gap-1.5">
				<Button
					size="sm"
					type="button"
					variant="outline"
					disabled={disabled || !name.trim()}
					onClick={rename}
				>
					<CheckIcon aria-hidden className="w-3.5 h-3.5" />
					Rename
				</Button>
				<Button
					size="sm"
					type="button"
					disabled={disabled}
					onClick={updateStyle}
				>
					<RefreshCwIcon aria-hidden className="w-3.5 h-3.5" />
					Update style
				</Button>
			</div>
			<p className="text-[11px] text-muted-foreground">
				<span className="font-medium text-foreground">Rename</span> changes only
				the name.{" "}
				<span className="font-medium text-foreground">Update style</span>{" "}
				overwrites this template&apos;s saved writing style with your current
				style.
			</p>
		</div>
	);
}

/** Hover/focus tooltip showing a style template's summary. */
