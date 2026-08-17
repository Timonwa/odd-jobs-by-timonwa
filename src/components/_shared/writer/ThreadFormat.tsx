"use client";

import { useId } from "react";

import { Input, ToggleButton } from "@/components/ui";

type ThreadFormatProps = {
	length: number;
	onChange: (length: number) => void;
	disabled?: boolean;
};

export function ThreadFormat({
	length,
	onChange,
	disabled,
}: ThreadFormatProps) {
	const threadLengthId = useId();
	return (
		<fieldset className="min-w-0 border-0 p-0">
			<legend className="text-sm font-medium mb-2">Thread format</legend>
			<div className="flex items-center gap-3 flex-wrap">
				<div className="flex gap-2">
					<ToggleButton
						active={length === 1}
						aria-pressed={length === 1}
						onClick={() => onChange(1)}
						disabled={disabled}
					>
						Single post
					</ToggleButton>
					<ToggleButton
						active={length > 1}
						aria-pressed={length > 1}
						onClick={() => onChange(length > 1 ? length : 4)}
						disabled={disabled}
					>
						Thread
					</ToggleButton>
				</div>
				{length > 1 && (
					<div className="flex items-center gap-2 text-sm">
						<label htmlFor={threadLengthId} className="text-muted-foreground">
							Posts <span className="text-[11px]">(2-20)</span>:
						</label>
						<Input
							id={threadLengthId}
							type="number"
							min={2}
							max={20}
							value={length}
							onChange={(e) =>
								onChange(Math.min(20, Math.max(2, Number(e.target.value) || 4)))
							}
							disabled={disabled}
							className="w-16"
						/>
					</div>
				)}
			</div>
			<p className="mt-1.5 text-[11px] text-muted-foreground">
				Applies to thread-capable platforms (X, Bluesky, Threads, Mastodon).
				LinkedIn and Substack are always single posts.
			</p>
		</fieldset>
	);
}
