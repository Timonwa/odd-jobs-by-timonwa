"use client";

import {
	BookmarkIcon,
	CheckIcon,
	ChevronDownIcon,
	PenLineIcon,
	XIcon,
} from "lucide-react";
import { useState } from "react";
import {
	MAX_SOCIAL_POST_STYLE_TEMPLATE_NAME_CHARS,
	MAX_SOCIAL_POST_STYLE_TEMPLATES,
} from "@/lib/constants";
import type { SocialPostStyleTemplate } from "@/lib/types";
import { Badge, Button, Input, Tooltip } from "@/components/ui";

import { cn } from "@/lib/utils";

type TemplatesPickerProps = {
	templates: SocialPostStyleTemplate[];
	activeTemplateId: string | null;
	onApply: (t: SocialPostStyleTemplate) => void;
	onSave: (name: string) => void;
	onDelete: (id: string) => void;
	onUpdate: (id: string) => void;
	onRename: (id: string, name: string) => void;
	disabled?: boolean;
	collapsible?: boolean;
	// When set, shows a button that opens the full Writing style panel.
	onOpenSettings?: () => void;
	// Apply-only: hides save/rename/update/delete (used on the generate form).
	selectOnly?: boolean;
};

/** Style-template picker — apply a saved writing style on click. Unless `selectOnly`, also save the current style and rename/update/delete existing ones. */
import { TemplateChip } from "./templates/TemplateChip";
import { TemplateEditor } from "./templates/TemplateEditor";

export function TemplatesPicker({
	templates,
	activeTemplateId,
	onApply,
	onSave,
	onDelete,
	onUpdate,
	onRename,
	disabled,
	collapsible,
	onOpenSettings,
	selectOnly,
}: TemplatesPickerProps) {
	const [nameDraft, setNameDraft] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [expanded, setExpanded] = useState(!collapsible);

	const full = templates.length >= MAX_SOCIAL_POST_STYLE_TEMPLATES;
	const activeTemplate = templates.find((t) => t.id === activeTemplateId);

	const commitSave = () => {
		const name = nameDraft.trim();
		if (!name) return;
		onSave(name);
		setNameDraft("");
		setIsSaving(false);
	};

	const cancelSave = () => {
		setNameDraft("");
		setIsSaving(false);
	};

	return (
		<div className="flex flex-col rounded-md border border-border bg-muted/30 p-2.5 gap-2">
			<div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
				{collapsible ? (
					<button
						type="button"
						onClick={() => setExpanded((e) => !e)}
						aria-expanded={expanded}
						className="flex min-w-0 items-center gap-1.5 text-xs font-medium"
					>
						<BookmarkIcon
							aria-hidden
							className="w-3.5 h-3.5 shrink-0 text-primary"
						/>
						<span className="shrink-0">Style templates</span>
						<span className="shrink-0 text-muted-foreground">
							({templates.length})
						</span>
						<ChevronDownIcon
							aria-hidden
							className={cn(
								"w-3.5 h-3.5 shrink-0 text-muted-foreground transition-transform",
								expanded && "rotate-180",
							)}
						/>
					</button>
				) : (
					<div className="flex items-center gap-1.5 text-xs font-medium">
						<BookmarkIcon aria-hidden className="w-3.5 h-3.5 text-primary" />
						Style templates
					</div>
				)}

				{activeTemplate && (
					<Badge variant="primary" className="min-w-0 max-w-full">
						<CheckIcon aria-hidden className="w-3 h-3 shrink-0" />
						<span className="truncate">{activeTemplate.name}</span>
					</Badge>
				)}

				<div className="ml-auto flex shrink-0 items-center gap-2">
					{onOpenSettings && (
						<button
							type="button"
							onClick={onOpenSettings}
							disabled={disabled}
							className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
						>
							<PenLineIcon aria-hidden className="w-3.5 h-3.5" />
							Writing style
						</button>
					)}
					{!selectOnly && !isSaving && (
						<button
							type="button"
							onClick={() => {
								setIsSaving(true);
								setExpanded(true);
							}}
							disabled={disabled || full || Boolean(activeTemplate)}
							title={
								full
									? `Max ${MAX_SOCIAL_POST_STYLE_TEMPLATES} style templates — delete one first`
									: activeTemplate
										? `This writing style is already saved as “${activeTemplate.name}”`
										: "Save the current writing style as a reusable template"
							}
							className="text-[11px] text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
						>
							+ Save current
						</button>
					)}
				</div>
			</div>

			{expanded && (
				<>
					<p className="text-[11px] text-muted-foreground">
						{selectOnly
							? "Apply a saved writing style in a click. Create and edit styles under Writing style."
							: "A saved writing style — tone, voice, emoji, hashtags, and length. Apply one in a click, update it to your current style, or rename it."}
					</p>

					{isSaving && (
						<div className="flex items-start gap-1.5">
							<div className="relative min-w-0 flex-1">
								<Input
									value={nameDraft}
									onChange={(e) => setNameDraft(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											commitSave();
										}
										if (e.key === "Escape") {
											e.preventDefault();
											cancelSave();
										}
									}}
									placeholder="Name it (e.g. Acme blog voice)"
									maxLength={MAX_SOCIAL_POST_STYLE_TEMPLATE_NAME_CHARS}
									className="h-8 w-full pr-12 text-xs"
								/>
								<span className="pointer-events-none absolute bottom-1 right-2 text-[10px] text-muted-foreground tabular-nums">
									{nameDraft.length}/{MAX_SOCIAL_POST_STYLE_TEMPLATE_NAME_CHARS}
								</span>
							</div>
							<Tooltip label="Save style template">
								<Button
									size="sm"
									type="button"
									onClick={commitSave}
									disabled={!nameDraft.trim()}
									aria-label="Save style template"
								>
									<CheckIcon aria-hidden className="w-3.5 h-3.5" />
								</Button>
							</Tooltip>
							<Tooltip label="Cancel">
								<Button
									size="sm"
									type="button"
									variant="ghost"
									onClick={cancelSave}
									aria-label="Cancel"
								>
									<XIcon aria-hidden className="w-3.5 h-3.5" />
								</Button>
							</Tooltip>
						</div>
					)}

					{templates.length === 0 ? (
						<p className="text-[11px] text-muted-foreground italic">
							{selectOnly
								? "No saved styles yet — create one under Writing style."
								: "Nothing saved yet. Set your writing style, then “Save current” to reuse it in one click."}
						</p>
					) : (
						<div className="flex flex-wrap items-center gap-1.5">
							{templates.map((t) =>
								!selectOnly && editingId === t.id ? (
									<TemplateEditor
										key={t.id}
										template={t}
										disabled={disabled}
										onRename={(name) => onRename(t.id, name)}
										onUpdate={() => onUpdate(t.id)}
										onDone={() => setEditingId(null)}
									/>
								) : (
									<TemplateChip
										key={t.id}
										template={t}
										active={activeTemplateId === t.id}
										disabled={disabled}
										editable={!selectOnly}
										onApply={() => onApply(t)}
										onEdit={() => setEditingId(t.id)}
										onDelete={() => onDelete(t.id)}
									/>
								),
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}

/** Style-template pill — apply on click; when editable, rename/update or delete via inline icon buttons. */
