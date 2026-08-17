"use client";

import { useId } from "react";

import { ToggleButton } from "@/components/ui";

import { SOCIAL_POST_TONES } from "@/lib/constants";
import type { SocialPostToneType } from "@/lib/constants";

type TonePickerProps = {
	value: SocialPostToneType;
	onChange: (tone: SocialPostToneType) => void;
	disabled?: boolean;
};

export function TonePicker({ value, onChange, disabled }: TonePickerProps) {
	const labelId = useId();
	return (
		<div className="flex flex-col gap-2">
			<div id={labelId} className="text-xs font-medium text-foreground">
				Tone
			</div>
			<fieldset
				aria-labelledby={labelId}
				className="flex flex-wrap gap-1.5 border-0 p-0 m-0 min-w-0"
			>
				{SOCIAL_POST_TONES.map((t) => (
					<ToggleButton
						key={t.value}
						size="sm"
						active={value === t.value}
						aria-pressed={value === t.value}
						aria-label={`Tone: ${t.label} — ${t.description}`}
						title={t.description}
						onClick={() => onChange(t.value)}
						disabled={disabled}
					>
						{t.label}
					</ToggleButton>
				))}
			</fieldset>
		</div>
	);
}
