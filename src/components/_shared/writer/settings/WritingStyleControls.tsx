"use client";

import { useId } from "react";

import { ToggleButton } from "@/components/ui";
import { TonePicker } from "@/components/_shared/writer/TonePicker";

import {
	SOCIAL_POST_EMOJI_DENSITY_LABELS,
	type SocialPostDensityLevelType,
	LONGFORM_SOCIAL_POST_LENGTH_LABELS,
	type LongformSocialPostLengthType,
	SOCIAL_POST_VOICE_LABELS,
	type SocialPostVoiceType,
} from "@/lib/constants";
import type { SocialPostStyleType } from "@/lib/types";

type WritingStyleControlsProps = {
	prefs: SocialPostStyleType;
	onChange: (patch: Partial<SocialPostStyleType>) => void;
};

const LEVELS: SocialPostDensityLevelType[] = [1, 2, 3, 4, 5];
const VOICES = Object.keys(SOCIAL_POST_VOICE_LABELS) as SocialPostVoiceType[];
const SOCIAL_POST_LENGTHS = Object.keys(
	LONGFORM_SOCIAL_POST_LENGTH_LABELS,
) as LongformSocialPostLengthType[];

/** Styled ToggleButton alias used across the style fieldsets. */
function Chip({
	active,
	label,
	children,
	onClick,
}: {
	active: boolean;
	label: string;
	children: React.ReactNode;
	onClick: () => void;
}) {
	return (
		<ToggleButton
			size="sm"
			active={active}
			aria-pressed={active}
			aria-label={label}
			onClick={onClick}
		>
			{children}
		</ToggleButton>
	);
}

/** Voice, emoji density, and post-length controls — the core of a writing style. Tone and hashtags are their own controls in the same panel. */
export function WritingStyleControls({
	prefs,
	onChange,
}: WritingStyleControlsProps) {
	const voiceLabelId = useId();
	const emojiLabelId = useId();
	const lengthLabelId = useId();

	return (
		<div className="flex flex-col gap-4">
			<TonePicker value={prefs.tone} onChange={(tone) => onChange({ tone })} />

			<div className="flex flex-col gap-2">
				<div id={voiceLabelId} className="text-xs font-medium text-foreground">
					Voice
				</div>
				<fieldset
					aria-labelledby={voiceLabelId}
					className="flex flex-wrap gap-1.5 border-0 p-0 m-0 min-w-0"
				>
					{VOICES.map((v) => (
						<Chip
							key={v}
							active={prefs.voice === v}
							label={`Voice: ${SOCIAL_POST_VOICE_LABELS[v]}`}
							onClick={() => onChange({ voice: v })}
						>
							{SOCIAL_POST_VOICE_LABELS[v]}
						</Chip>
					))}
				</fieldset>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<span
						id={emojiLabelId}
						className="text-xs font-medium text-foreground"
					>
						Emoji
					</span>
					<span className="text-[11px] text-muted-foreground">
						{SOCIAL_POST_EMOJI_DENSITY_LABELS[prefs.emojiLevel]}
					</span>
				</div>
				<fieldset
					aria-labelledby={emojiLabelId}
					className="grid grid-cols-5 gap-1 border-0 p-0 m-0 min-w-0"
				>
					{LEVELS.map((n) => (
						<Chip
							key={n}
							active={prefs.emojiLevel === n}
							label={`Emoji level ${n}: ${SOCIAL_POST_EMOJI_DENSITY_LABELS[n]}`}
							onClick={() => onChange({ emojiLevel: n })}
						>
							<span className="font-mono">{n}</span>
						</Chip>
					))}
				</fieldset>
			</div>

			<div className="flex flex-col gap-2">
				<div id={lengthLabelId} className="text-xs font-medium text-foreground">
					Post length{" "}
					<span className="text-muted-foreground font-normal">
						(LinkedIn &amp; Substack)
					</span>
				</div>
				<fieldset
					aria-labelledby={lengthLabelId}
					className="flex flex-wrap gap-1.5 border-0 p-0 m-0 min-w-0"
				>
					{SOCIAL_POST_LENGTHS.map((v) => (
						<Chip
							key={v}
							active={prefs.postLength === v}
							label={`Post length: ${LONGFORM_SOCIAL_POST_LENGTH_LABELS[v]} characters`}
							onClick={() => onChange({ postLength: v })}
						>
							{LONGFORM_SOCIAL_POST_LENGTH_LABELS[v]}
						</Chip>
					))}
				</fieldset>
				<p className="text-[11px] text-muted-foreground mt-1">
					Approximate characters per post.
				</p>
			</div>
		</div>
	);
}
