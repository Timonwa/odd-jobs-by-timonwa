"use client";

import { useId, useMemo, useState } from "react";

import { SourceReuseControls } from "@/components/_shared/source/SourceReuseControls";
import { useArticleSource } from "@/lib/hooks";
import {
	Card,
	CardContent,
	CopyButton,
	StatCard,
	Textarea,
	ToggleButton,
} from "@/components/ui";
import { countWords } from "@/lib/utils";
import {
	durationSeconds,
	formatDuration,
	READING_WPM,
	readingMinutes,
	type ReadingSpeedType,
	SPEAKING_WPM,
} from "@/lib/utils";

const SPEEDS: { id: ReadingSpeedType; label: string }[] = [
	{ id: "slow", label: "Slow" },
	{ id: "average", label: "Average" },
	{ id: "fast", label: "Fast" },
];

const numberFmt = new Intl.NumberFormat("en-US");

export function ReadingTimeTool() {
	const { text, setText, textReuse, toggleTextReuse, clear } =
		useArticleSource();
	const [speed, setSpeed] = useState<ReadingSpeedType>("average");
	const reuseId = useId();

	const words = useMemo(() => countWords(text), [text]);
	const wpm = READING_WPM[speed];
	const readLabel = `${readingMinutes(words, wpm)} min read`;

	return (
		<div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
			<Card className="min-w-0 self-start">
				<CardContent className="flex flex-col gap-3">
					<div className="flex flex-col gap-2">
						<label htmlFor="rt-input" className="text-sm font-medium">
							Your text
						</label>
						<Textarea
							id="rt-input"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Paste your article draft…"
							className="min-h-64 max-h-96 overflow-y-auto no-scrollbar"
						/>
					</div>
					<SourceReuseControls
						id={reuseId}
						reuse={textReuse}
						onToggleReuse={toggleTextReuse}
						onClear={clear}
						canClear={text.length > 0}
					/>
				</CardContent>
			</Card>

			<div className="flex min-w-0 flex-col gap-6">
				<fieldset className="flex min-w-0 flex-col gap-2 border-0 p-0">
					<legend className="text-sm font-medium text-muted-foreground">
						Reading speed
					</legend>
					<div className="flex flex-wrap gap-2">
						{SPEEDS.map((s) => (
							<ToggleButton
								key={s.id}
								active={speed === s.id}
								aria-pressed={speed === s.id}
								onClick={() => setSpeed(s.id)}
							>
								{s.label}
								<span className="text-xs text-muted-foreground">
									{READING_WPM[s.id]} wpm
								</span>
							</ToggleButton>
						))}
					</div>
				</fieldset>

				<dl className="grid gap-3">
					<StatCard
						label="Reading time"
						value={formatDuration(durationSeconds(words, wpm))}
						highlight
					/>
					<StatCard
						label="Speaking time"
						value={formatDuration(durationSeconds(words, SPEAKING_WPM))}
					/>
					<StatCard label="Words" value={numberFmt.format(words)} />
				</dl>

				<Card>
					<CardContent className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p className="text-sm font-medium">Blog label</p>
							<p className="text-xs text-muted-foreground">
								Drop this next to your post title.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<code className="rounded-md bg-muted px-2.5 py-1 text-sm">
								{readLabel}
							</code>
							<CopyButton value={readLabel} />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
