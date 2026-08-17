"use client";

import {
	FilePlus2Icon,
	Loader2Icon,
	SparklesIcon,
	Wand2Icon,
} from "lucide-react";
import { ArticleSourceInput } from "@/components/_shared/source/ArticleSourceInput";
import { ErrorNotice } from "@/components/_shared/result/ErrorNotice";
import type { ArticleSourceKind } from "@/lib/types";
import {
	MAX_ARTICLE_INPUT_CHARS,
	OPEN_SOCIAL_POST_SETTINGS_EVENT,
	type SocialPostPlatform,
	THREADABLE_SOCIAL_POST_PLATFORMS,
} from "@/lib/constants";
import type { SocialPostStyleTemplate } from "@/lib/types";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";

import { PlatformPicker } from "./PlatformPicker";
import { TemplatesPicker } from "./TemplatesPicker";
import { ThreadFormat } from "./ThreadFormat";

type GenerateFormProps = {
	sourceKind: ArticleSourceKind;
	onSourceKindChange: (kind: ArticleSourceKind) => void;
	url: string;
	onUrlChange: (url: string) => void;
	text: string;
	onTextChange: (text: string) => void;
	textReuse: boolean;
	onToggleTextReuse: (next: boolean) => void;
	urlReuse: boolean;
	onToggleUrlReuse: (next: boolean) => void;
	onClearSource: () => void;
	platforms: SocialPostPlatform[];
	onTogglePlatform: (p: SocialPostPlatform) => void;
	xThreadLength: number;
	onXThreadLengthChange: (n: number) => void;
	isGenerating: boolean;
	isBusy: boolean;
	hasResult: boolean;
	isNewArticle: boolean;
	onStartOver: () => void;
	error: string | null;
	onSubmit: (e: React.FormEvent) => void;
	templates: SocialPostStyleTemplate[];
	activeTemplateId: string | null;
	onApplyTemplate: (t: SocialPostStyleTemplate) => void;
	onSaveTemplate: (name: string) => void;
	onDeleteTemplate: (id: string) => void;
	onUpdateTemplate: (id: string) => void;
	onRenameTemplate: (id: string, name: string) => void;
};

export function GenerateForm({
	sourceKind,
	onSourceKindChange,
	url,
	onUrlChange,
	text,
	onTextChange,
	textReuse,
	onToggleTextReuse,
	urlReuse,
	onToggleUrlReuse,
	onClearSource,
	platforms,
	onTogglePlatform,
	xThreadLength,
	onXThreadLengthChange,
	isGenerating,
	isBusy,
	hasResult,
	isNewArticle,
	onStartOver,
	error,
	onSubmit,
	templates,
	activeTemplateId,
	onApplyTemplate,
	onSaveTemplate,
	onDeleteTemplate,
	onUpdateTemplate,
	onRenameTemplate,
}: GenerateFormProps) {
	const hasInput =
		sourceKind === "url" ? url.trim().length > 0 : text.trim().length > 0;
	const textOver = text.length > MAX_ARTICLE_INPUT_CHARS;
	const disabled = isBusy || !hasInput || platforms.length === 0 || textOver;
	// Only call it "Regenerate" when the current input is the article on screen.
	// A changed source reads as "Generate" so it never looks like an overwrite.
	const isRegenerate = hasResult && !isNewArticle;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Wand2Icon className="w-5 h-5 text-primary" />
					Generate social media posts
				</CardTitle>
				<CardDescription>
					Paste an article&apos;s URL or text — we draft a post for every
					platform you pick, ready to copy and post yourself.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit} className="flex flex-col gap-4">
					<TemplatesPicker
						templates={templates}
						activeTemplateId={activeTemplateId}
						onApply={onApplyTemplate}
						onSave={onSaveTemplate}
						onDelete={onDeleteTemplate}
						onUpdate={onUpdateTemplate}
						onRename={onRenameTemplate}
						onOpenSettings={() =>
							window.dispatchEvent(new Event(OPEN_SOCIAL_POST_SETTINGS_EVENT))
						}
						selectOnly
						disabled={isGenerating}
						collapsible
					/>

					<ArticleSourceInput
						sourceKind={sourceKind}
						onSourceKindChange={onSourceKindChange}
						url={url}
						onUrlChange={onUrlChange}
						urlReuse={urlReuse}
						onToggleUrlReuse={onToggleUrlReuse}
						text={text}
						onTextChange={onTextChange}
						textReuse={textReuse}
						onToggleTextReuse={onToggleTextReuse}
						onClearText={onClearSource}
						disabled={isGenerating}
						maxChars={MAX_ARTICLE_INPUT_CHARS}
					/>

					<PlatformPicker
						value={platforms}
						onToggle={onTogglePlatform}
						disabled={isGenerating}
					/>

					{platforms.some((p) =>
						THREADABLE_SOCIAL_POST_PLATFORMS.includes(p),
					) && (
						<ThreadFormat
							length={xThreadLength}
							onChange={onXThreadLengthChange}
							disabled={isGenerating}
						/>
					)}

					<div className="flex flex-col gap-2 sm:flex-row">
						<Button
							type="submit"
							size="lg"
							className="w-full sm:flex-1"
							disabled={disabled}
						>
							{isGenerating ? (
								<>
									<Loader2Icon className="w-4 h-4 animate-spin" />
									{sourceKind === "url"
										? `Reading article & ${isRegenerate ? "regenerating" : "generating"} posts...`
										: `${isRegenerate ? "Regenerating" : "Generating"} posts...`}
								</>
							) : (
								<>
									<SparklesIcon className="w-4 h-4" />
									{isRegenerate ? "Regenerate posts" : "Generate posts"}
								</>
							)}
						</Button>

						{hasResult && (
							<Button
								type="button"
								variant="outline"
								size="lg"
								onClick={onStartOver}
								disabled={isBusy}
								className="w-full sm:w-auto"
								title="Clear the current posts and start a fresh article — your saved posts stay in history"
							>
								<FilePlus2Icon className="w-4 h-4" />
								New article
							</Button>
						)}
					</div>

					{error && <ErrorNotice message={error} />}
				</form>
			</CardContent>
		</Card>
	);
}
