"use client";

import {
	ClipboardCheckIcon,
	ClipboardCopyIcon,
	Loader2Icon,
	RefreshCwIcon,
} from "lucide-react";
import {
	SOCIAL_POST_PLATFORM_COLORS,
	SOCIAL_POST_PLATFORM_LABELS,
} from "@/lib/constants";
import type { SocialPost } from "@/lib/types";
import {
	PLATFORM_ICONS,
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Textarea,
	Tooltip,
} from "@/components/ui";
import { TINT_TEXT } from "@/lib/config/tints";

/** Character-count class — destructive when over, amber when within 10% of limit. */
const charCountClass = (count: number, limit: number): string =>
	count > limit
		? "text-destructive font-semibold"
		: count > limit * 0.9
			? TINT_TEXT[2]
			: "text-muted-foreground";

type PostCardProps = {
	post: SocialPost;
	isRegenerating: boolean;
	busy: boolean;
	copied: boolean;
	onContentChange: (content: string) => void;
	onThreadPostChange: (index: number, content: string) => void;
	onCopy: () => void;
	onRegenerate: () => void;
};

export function PostCard({
	post,
	isRegenerating,
	busy,
	copied,
	onContentChange,
	onThreadPostChange,
	onCopy,
	onRegenerate,
}: PostCardProps) {
	const isThread = post.thread && post.thread.length > 1;
	const regenLabel = isThread
		? "Regenerate this thread"
		: "Regenerate this post";
	const Icon = PLATFORM_ICONS[post.platform];
	const label = SOCIAL_POST_PLATFORM_LABELS[post.platform];
	const limit = post.charLimit;

	return (
		<Card className="min-w-0 break-inside-avoid">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base flex-wrap">
					<Icon
						aria-hidden
						className={`w-4 h-4 shrink-0 ${SOCIAL_POST_PLATFORM_COLORS[post.platform]}`}
					/>
					<span className="leading-snug">
						{label}
						{isThread && ` · Thread (${post.thread?.length})`}
					</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{isThread ? (
					<div className="flex flex-col gap-2">
						{post.thread?.map((threadLine, i) => (
							<div
								key={i}
								className="flex flex-col rounded-md border border-border bg-muted/30 p-2 gap-1"
							>
								<div className="text-[10px] text-muted-foreground">
									{i + 1} / {post.thread?.length}
								</div>
								<Textarea
									aria-label={`${label} thread post ${i + 1} of ${post.thread?.length}`}
									value={threadLine}
									onChange={(e) => onThreadPostChange(i, e.target.value)}
									className="resize-none text-sm"
								/>
								<div
									className={`text-[10px] text-right font-mono ${charCountClass(threadLine.length, limit)}`}
								>
									{threadLine.length} / {limit}
								</div>
							</div>
						))}
					</div>
				) : (
					<>
						<Textarea
							aria-label={`${label} post content`}
							value={post.content}
							onChange={(e) => onContentChange(e.target.value)}
							className={
								limit >= 1500
									? "h-64 resize-y [field-sizing:normal]"
									: "resize-none"
							}
						/>
						<output
							aria-label={`${post.charCount} of ${limit} characters used`}
							className={`block text-xs font-mono text-right ${charCountClass(post.charCount, limit)}`}
						>
							{post.charCount} / {limit}
						</output>
					</>
				)}

				{post.hashtags.length > 0 && (
					<div className="flex flex-wrap gap-1">
						{post.hashtags.map((h) => (
							<Badge
								key={h}
								className="border-transparent bg-accent text-accent-foreground"
							>
								#{h.replace(/^#/, "")}
							</Badge>
						))}
					</div>
				)}

				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						onClick={onCopy}
					>
						{copied ? (
							<>
								<ClipboardCheckIcon className="w-4 h-4" />
								Copied
							</>
						) : (
							<>
								<ClipboardCopyIcon className="w-4 h-4" />
								Copy
							</>
						)}
					</Button>

					<Tooltip label={regenLabel}>
						<Button
							variant="outline"
							size="sm"
							onClick={onRegenerate}
							disabled={busy}
							aria-label={regenLabel}
						>
							{isRegenerating ? (
								<Loader2Icon className="w-4 h-4 animate-spin" />
							) : (
								<RefreshCwIcon className="w-4 h-4" />
							)}
						</Button>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
}
