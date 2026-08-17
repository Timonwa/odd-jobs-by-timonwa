"use client";

import { ClipboardCheckIcon, ClipboardCopyIcon } from "lucide-react";

import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import type { ArticleMetaType, TokenUsageType } from "@/lib/types";

type Props = {
	article: ArticleMetaType;
	usage: TokenUsageType | null;
	copied: boolean;
	onCopyAll: () => void;
	copyLabel: string;
};

// Safely extracts an HTTP or HTTPS URL from a string, returning undefined if invalid.
function safeHttpUrl(url: string | undefined): string | undefined {
	if (!url) return undefined;
	try {
		const { protocol } = new URL(url);
		return protocol === "http:" || protocol === "https:" ? url : undefined;
	} catch {
		return undefined;
	}
}

/** Results header for the draft-based AI tools: source title/author/link, token usage, copy-all. */
export function ArticleCard({
	article,
	usage,
	copied,
	onCopyAll,
	copyLabel,
}: Props) {
	const linkUrl = safeHttpUrl(article.url);
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<CardTitle className="text-base">Article</CardTitle>
					<Button variant="ghost" size="sm" onClick={onCopyAll}>
						{copied ? (
							<>
								<ClipboardCheckIcon className="w-4 h-4" />
								Copied all
							</>
						) : (
							<>
								<ClipboardCopyIcon className="w-4 h-4" />
								{copyLabel}
							</>
						)}
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<h4 className="font-semibold text-sm leading-snug mb-1">
					{article.title || "Untitled"}
				</h4>
				<div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
					{article.author && <span>by {article.author}</span>}
					{linkUrl ? (
						<a
							href={linkUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="truncate hover:text-foreground underline underline-offset-2"
						>
							{linkUrl}
						</a>
					) : (
						<span className="italic">Pasted text</span>
					)}
					{usage && usage.totalTokens > 0 && (
						<span
							title={`Prompt: ${usage.promptTokens} · Completion: ${usage.completionTokens}`}
							className="font-mono"
						>
							· {usage.totalTokens.toLocaleString()} tokens
						</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
