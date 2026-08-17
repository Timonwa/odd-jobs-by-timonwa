"use client";

import { HashIcon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import {
	MAX_SOCIAL_POST_HASHTAG_RULES_PER_LIST,
	SOCIAL_POST_DENSITY_LEVELS,
	SOCIAL_POST_HASHTAG_DENSITY_LABELS,
} from "@/lib/constants";
import { normalizeHashtag } from "@/lib/utils";
import type { SocialPostStyleType } from "@/lib/types";
import { Badge, Input, ToggleButton } from "@/components/ui";

type HashtagsProps = {
	prefs: SocialPostStyleType;
	onChange: (patch: Partial<SocialPostStyleType>) => void;
	// Always-include / never-use lists — only for tools that enable hashtag rules.
	showRules?: boolean;
};

type FieldType = "alwaysIncludeHashtags" | "neverUseHashtags";

/** All hashtag settings in one place: how many the agent adds (amount), plus optional always-include / never-use rules. */
export default function HashtagsSection({
	prefs,
	onChange,
	showRules,
}: HashtagsProps) {
	const headingId = useId();
	const amountLabelId = useId();

	const add = (field: FieldType, raw: string) => {
		const tag = normalizeHashtag(raw);
		if (!tag) return;
		const current = prefs[field];
		const dupe = current.some((t) => t.toLowerCase() === tag.toLowerCase());
		if (dupe || current.length >= MAX_SOCIAL_POST_HASHTAG_RULES_PER_LIST)
			return;
		onChange({ [field]: [...current, tag] });
	};

	const remove = (field: FieldType, tag: string) => {
		onChange({ [field]: prefs[field].filter((t) => t !== tag) });
	};

	return (
		<section aria-labelledby={headingId} className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<HashIcon aria-hidden className="w-4 h-4 text-primary" />
				<h3 id={headingId} className="text-sm font-semibold">
					Hashtags
				</h3>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<span
						id={amountLabelId}
						className="text-xs font-medium text-foreground"
					>
						Amount
					</span>
					<span className="text-[11px] text-muted-foreground">
						{SOCIAL_POST_HASHTAG_DENSITY_LABELS[prefs.hashtagLevel]}
					</span>
				</div>
				<fieldset
					aria-labelledby={amountLabelId}
					className="grid grid-cols-5 gap-1 border-0 p-0 m-0 min-w-0"
				>
					{SOCIAL_POST_DENSITY_LEVELS.map((n) => (
						<ToggleButton
							key={n}
							size="sm"
							active={prefs.hashtagLevel === n}
							aria-pressed={prefs.hashtagLevel === n}
							aria-label={`Hashtag amount ${n}: ${SOCIAL_POST_HASHTAG_DENSITY_LABELS[n]}`}
							onClick={() => onChange({ hashtagLevel: n })}
						>
							<span className="font-mono">{n}</span>
						</ToggleButton>
					))}
				</fieldset>
			</div>

			{showRules && (
				<>
					<TagList
						label="Always include"
						helper="Added to every generated post (counts toward the amount)."
						tags={prefs.alwaysIncludeHashtags}
						onAdd={(raw) => add("alwaysIncludeHashtags", raw)}
						onRemove={(tag) => remove("alwaysIncludeHashtags", tag)}
					/>

					<TagList
						label="Never use"
						helper="Filtered out of every generated post (case-insensitive)."
						tags={prefs.neverUseHashtags}
						onAdd={(raw) => add("neverUseHashtags", raw)}
						onRemove={(tag) => remove("neverUseHashtags", tag)}
					/>
				</>
			)}
		</section>
	);
}

/** Single hashtag list — label, tag pills, and a commit-on-enter/blur input. */
function TagList({
	label,
	helper,
	tags,
	onAdd,
	onRemove,
}: {
	label: string;
	helper: string;
	tags: string[];
	onAdd: (raw: string) => void;
	onRemove: (tag: string) => void;
}) {
	const inputId = useId();
	const [draft, setDraft] = useState("");
	const full = tags.length >= MAX_SOCIAL_POST_HASHTAG_RULES_PER_LIST;

	const commit = () => {
		if (!draft.trim()) return;
		onAdd(draft);
		setDraft("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			commit();
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={inputId} className="text-xs font-medium block">
				{label}
			</label>

			<div className="flex flex-wrap gap-1.5">
				{tags.length === 0 && (
					<span className="text-[11px] text-muted-foreground italic">None</span>
				)}
				{tags.map((tag) => (
					<Badge key={tag} variant="primary">
						<span className="font-mono">#{tag}</span>
						<button
							type="button"
							onClick={() => onRemove(tag)}
							aria-label={`Remove #${tag}`}
							className="hover:text-destructive"
						>
							<XIcon aria-hidden className="w-3 h-3" />
						</button>
					</Badge>
				))}
			</div>

			<div className="flex gap-1.5">
				<Input
					id={inputId}
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={commit}
					placeholder={full ? "Remove one to add more" : "Type a tag + Enter"}
					disabled={full}
					spellCheck={false}
					className="h-8 text-xs"
				/>
			</div>

			<p className="text-[10px] text-muted-foreground">{helper}</p>
		</div>
	);
}
