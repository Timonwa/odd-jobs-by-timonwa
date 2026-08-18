"use client";

import { useId } from "react";

import { SourceReuseControls } from "./SourceReuseControls";
import { SourceKindTabs } from "./SourceKindTabs";
import { Input, Textarea } from "@/components/ui";
import { MAX_ARTICLE_INPUT_CHARS } from "@/lib/constants";
import type { ArticleSourceKind } from "@/lib/types";
import { cn } from "@/lib/utils";

type ArticleSourceInputProps = {
	sourceKind: ArticleSourceKind;
	onSourceKindChange: (kind: ArticleSourceKind) => void;
	url: string;
	onUrlChange: (value: string) => void;
	urlReuse: boolean;
	onToggleUrlReuse: (next: boolean) => void;
	text: string;
	onTextChange: (value: string) => void;
	textReuse: boolean;
	onToggleTextReuse: (next: boolean) => void;
	onClearText: () => void;
	disabled?: boolean;
	maxChars?: number;
	urlPlaceholder?: string;
	textPlaceholder?: string;
};

/** Article-source section for the AI tools: URL/paste tabs, field + counter, and reuse controls. */
export function ArticleSourceInput({
	sourceKind,
	onSourceKindChange,
	url,
	onUrlChange,
	urlReuse,
	onToggleUrlReuse,
	text,
	onTextChange,
	textReuse,
	onToggleTextReuse,
	onClearText,
	disabled,
	maxChars = MAX_ARTICLE_INPUT_CHARS,
	urlPlaceholder = "https://your-blog.com/post-slug",
	textPlaceholder = "Paste the full article, or a near-final draft…",
}: ArticleSourceInputProps) {
	const urlId = useId();
	const textId = useId();
	const counterId = useId();
	const urlReuseId = useId();
	const textReuseId = useId();

	const over = text.length > maxChars;

	return (
		<div>
			<SourceKindTabs
				value={sourceKind}
				onChange={onSourceKindChange}
				disabled={disabled}
				textLabel="Paste text"
			/>

			{sourceKind === "url" ? (
				<div className="mt-3">
					<label htmlFor={urlId} className="block text-sm font-medium mb-2">
						Article URL
					</label>
					<Input
						id={urlId}
						type="url"
						required
						value={url}
						onChange={(e) => onUrlChange(e.target.value)}
						placeholder={urlPlaceholder}
						disabled={disabled}
					/>
					<SourceReuseControls
						id={urlReuseId}
						reuse={urlReuse}
						onToggleReuse={onToggleUrlReuse}
						onClear={() => onUrlChange("")}
						canClear={url.trim().length > 0}
						disabled={disabled}
						className="mt-2"
						noun="link"
						scope="the AI tools"
					/>
				</div>
			) : (
				<div className="mt-3">
					<div className="flex items-baseline justify-between mb-2 gap-2">
						<label htmlFor={textId} className="text-sm font-medium">
							Your text
						</label>
						{/* No aria-live: this updated on every keystroke, so a screen reader
						    announced the character count instead of the user's typing. The
						    textarea's aria-describedby points here, so it is read on focus
						    and on demand. */}
						<span
							id={counterId}
							className={cn(
								"text-xs tabular-nums",
								over ? "text-destructive font-medium" : "text-muted-foreground",
							)}
						>
							{text.length.toLocaleString()} / {maxChars.toLocaleString()}
						</span>
					</div>
					<Textarea
						id={textId}
						required
						value={text}
						onChange={(e) => onTextChange(e.target.value)}
						placeholder={textPlaceholder}
						disabled={disabled}
						aria-describedby={counterId}
						aria-invalid={over || undefined}
						className="h-48 max-h-96 resize-y [field-sizing:normal]"
					/>
					<p className="mt-1.5 text-[11px] text-muted-foreground">
						Your text stays in your browser and this request only — never cached
						on our servers.
					</p>
					<SourceReuseControls
						id={textReuseId}
						reuse={textReuse}
						onToggleReuse={onToggleTextReuse}
						onClear={onClearText}
						canClear={text.length > 0}
						disabled={disabled}
						className="mt-2"
						noun="text"
					/>
				</div>
			)}
		</div>
	);
}
