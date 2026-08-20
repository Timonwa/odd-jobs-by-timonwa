"use client";

import { ToggleButton, PLATFORM_ICONS } from "@/components/ui";
import {
	SOCIAL_POST_PLATFORMS,
	SOCIAL_POST_PLATFORM_COLORS,
	SOCIAL_POST_PLATFORM_LABELS,
} from "@/lib/constants";
import type { SocialPostPlatform } from "@/lib/constants";
type PlatformPickerProps = {
	value: SocialPostPlatform[];
	onToggle: (platform: SocialPostPlatform) => void;
	disabled?: boolean;
};

export function PlatformPicker({
	value,
	onToggle,
	disabled,
}: PlatformPickerProps) {
	return (
		<fieldset className="min-w-0 border-0 p-0">
			<legend className="text-sm font-medium mb-2">Platforms</legend>
			<div className="flex gap-2 flex-wrap">
				{SOCIAL_POST_PLATFORMS.map((p) => {
					const Icon = PLATFORM_ICONS[p];
					const active = value.includes(p);
					return (
						<ToggleButton
							key={p}
							active={active}
							aria-pressed={active}
							onClick={() => onToggle(p)}
							disabled={disabled}
						>
							<Icon
								aria-hidden
								className={`w-4 h-4 ${SOCIAL_POST_PLATFORM_COLORS[p]}`}
							/>
							{SOCIAL_POST_PLATFORM_LABELS[p]}
						</ToggleButton>
					);
				})}
			</div>
		</fieldset>
	);
}
