"use client";
// Read-only summary of what a template's style settings are.

import {
	SOCIAL_POST_EMOJI_DENSITY_LABELS,
	SOCIAL_POST_HASHTAG_DENSITY_LABELS,
	SOCIAL_POST_VOICE_LABELS,
} from "@/lib/constants";
import type { SocialPostStyleTemplate } from "@/lib/types";
import { SOCIAL_POST_TONES, type SocialPostTone } from "@/lib/constants";

const toneLabel = (tone: SocialPostTone): string =>
	SOCIAL_POST_TONES.find((t) => t.value === tone)?.label ?? tone;

export function TemplatePreview({
	template,
}: {
	template: SocialPostStyleTemplate;
}) {
	const p = template.style;
	return (
		<div
			role="tooltip"
			className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-border/60 bg-popover/90 backdrop-blur-md px-3 py-2 text-[11px] leading-snug text-popover-foreground shadow-md opacity-0 translate-y-1 transition-all duration-150 ease-out group-hover/preview:opacity-100 group-hover/preview:translate-y-0 group-focus-within/preview:opacity-100 group-focus-within/preview:translate-y-0"
		>
			<div className="flex flex-col gap-1">
				<Row label="Tone" value={toneLabel(p.tone)} />
				<Row
					label="Voice"
					value={SOCIAL_POST_VOICE_LABELS[p.voice] ?? p.voice}
				/>
				<Row
					label="Emoji"
					value={SOCIAL_POST_EMOJI_DENSITY_LABELS[p.emojiLevel]}
				/>
				<Row
					label="Hashtags"
					value={SOCIAL_POST_HASHTAG_DENSITY_LABELS[p.hashtagLevel]}
				/>
				{p.alwaysIncludeHashtags.length > 0 && (
					<Row
						label="Always"
						value={p.alwaysIncludeHashtags.map((t) => `#${t}`).join(" ")}
					/>
				)}
				{p.neverUseHashtags.length > 0 && (
					<Row
						label="Never"
						value={p.neverUseHashtags.map((t) => `#${t}`).join(" ")}
					/>
				)}
			</div>
		</div>
	);
}

/** Label-value row inside the style-template tooltip. */
export function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex gap-2">
			<span className="text-muted-foreground min-w-16">{label}</span>
			<span className="font-medium text-foreground wrap-break-word">
				{value}
			</span>
		</div>
	);
}
