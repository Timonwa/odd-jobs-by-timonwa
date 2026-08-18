"use client";
// One saved style template, as a selectable chip with rename and delete.

import { useState } from "react";
import { CheckIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { Tooltip } from "@/components/ui";
import type { SocialPostStyleTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TemplatePreview } from "./TemplatePreview";

export function TemplateChip({
	template,
	active,
	disabled,
	editable,
	onApply,
	onEdit,
	onDelete,
}: {
	template: SocialPostStyleTemplate;
	active: boolean;
	disabled?: boolean;
	editable: boolean;
	onApply: () => void;
	onEdit: () => void;
	onDelete: () => void;
}) {
	// Two-step delete: the first click arms the confirm, the second removes.
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	return (
		<div className="inline-flex items-center gap-0.5">
			<span className="group/preview relative inline-flex">
				<button
					type="button"
					onClick={onApply}
					disabled={disabled}
					aria-pressed={active}
					className={cn(
						"rounded-md border pl-2.5 pr-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
						confirmingDelete
							? "border-destructive/50 bg-destructive/5"
							: active
								? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
								: "border-border bg-background hover:bg-accent",
					)}
				>
					{active && !confirmingDelete && (
						<CheckIcon
							aria-hidden
							className="inline-block w-3 h-3 mr-1 -mt-px align-middle"
						/>
					)}
					{template.name}
				</button>
				<TemplatePreview template={template} />
			</span>
			{editable &&
				(confirmingDelete ? (
					<>
						<Tooltip label="Confirm delete">
							<button
								type="button"
								onClick={() => {
									onDelete();
									setConfirmingDelete(false);
								}}
								aria-label={`Confirm delete style template ${template.name}`}
								disabled={disabled}
								className="rounded-md p-1 text-destructive hover:bg-destructive/10 transition-colors disabled:cursor-not-allowed"
							>
								<Trash2Icon aria-hidden className="w-3.5 h-3.5" />
							</button>
						</Tooltip>
						<Tooltip label="Cancel">
							<button
								type="button"
								onClick={() => setConfirmingDelete(false)}
								aria-label="Cancel delete"
								className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
							>
								<XIcon aria-hidden className="w-3.5 h-3.5" />
							</button>
						</Tooltip>
					</>
				) : (
					<>
						<Tooltip label="Rename or update to current style">
							<button
								type="button"
								onClick={onEdit}
								aria-label={`Edit style template ${template.name}`}
								disabled={disabled}
								className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:cursor-not-allowed"
							>
								<PencilIcon aria-hidden className="w-3.5 h-3.5" />
							</button>
						</Tooltip>
						<Tooltip label="Delete style template">
							<button
								type="button"
								onClick={() => setConfirmingDelete(true)}
								aria-label={`Delete style template ${template.name}`}
								disabled={disabled}
								className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:cursor-not-allowed"
							>
								<Trash2Icon aria-hidden className="w-3.5 h-3.5" />
							</button>
						</Tooltip>
					</>
				))}
		</div>
	);
}

/** Inline editor for a style template — rename only, or rename and overwrite its saved style. */
