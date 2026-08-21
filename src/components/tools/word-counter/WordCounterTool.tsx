"use client";

import { useId, useRef } from "react";

import { SourceReuseControls } from "@/components/_shared/source";
import { useArticleSource } from "@/lib/hooks";
import { Card, CardContent, StatCard, Textarea } from "@/components/ui";
import {
	getTextCounts,
	durationSeconds,
	formatDuration,
	READING_WPM,
	SPEAKING_WPM,
	cn,
	trackEvent,
} from "@/lib/utils";
import {
	SEO_META_DESC_MAX,
	SEO_META_TITLE_MAX,
	SOCIAL_POST_PLATFORM_CHAR_LIMITS,
} from "@/lib/constants";
// Every number here already exists as a constant elsewhere in the app — read
// them rather than restating, so retuning a limit can't leave this bar behind.
const PLATFORM_LIMITS: { label: string; limit: number }[] = [
	{ label: "SEO title", limit: SEO_META_TITLE_MAX },
	{ label: "Meta description", limit: SEO_META_DESC_MAX },
	{ label: "X / Twitter post", limit: SOCIAL_POST_PLATFORM_CHAR_LIMITS.x },
	{ label: "Bluesky post", limit: SOCIAL_POST_PLATFORM_CHAR_LIMITS.bluesky },
	{
		label: "LinkedIn post",
		limit: SOCIAL_POST_PLATFORM_CHAR_LIMITS.linkedin,
	},
];

const numberFmt = new Intl.NumberFormat("en-US");

/** Live word/character counter with reading-time estimates and per-platform character-limit bars. */
export function WordCounterTool() {
	const { text, setText, textReuse, toggleTextReuse, clear } =
		useArticleSource();
	// This tool has no button to attach a `data-umami-event` to — it counts as
	// you type. Fired once per mount so the metric is people, not keystrokes.
	const hasTrackedUse = useRef(false);
	const handleTextChange = (next: string) => {
		if (!hasTrackedUse.current && next.trim() !== "") {
			hasTrackedUse.current = true;
			trackEvent("tool-use");
		}
		setText(next);
	};
	const reuseId = useId();
	const counts = getTextCounts(text);

	const stats = [
		{ label: "Words", value: counts.words },
		{ label: "Characters", value: counts.characters },
		{ label: "Characters (no spaces)", value: counts.charactersNoSpaces },
		{ label: "Sentences", value: counts.sentences },
		{ label: "Paragraphs", value: counts.paragraphs },
		{ label: "Lines", value: counts.lines },
	];

	const readTime = formatDuration(
		durationSeconds(counts.words, READING_WPM.average),
	);
	const speakTime = formatDuration(durationSeconds(counts.words, SPEAKING_WPM));

	return (
		<div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
			<Card className="min-w-0 self-start">
				<CardContent className="flex flex-col gap-3">
					<div className="flex flex-col gap-2">
						<label htmlFor="counter-input" className="text-sm font-medium">
							Your text
						</label>
						<Textarea
							id="counter-input"
							value={text}
							onChange={(e) => handleTextChange(e.target.value)}
							placeholder="Paste or type your text…"
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

			<div className="@container flex min-w-0 flex-col gap-6">
				<section aria-label="Counts" className="flex flex-col gap-2">
					<h2 className="text-sm font-medium text-muted-foreground">Counts</h2>
					<dl className="grid grid-cols-2 gap-3 @lg:grid-cols-3">
						{stats.map((s) => (
							<StatCard
								key={s.label}
								label={s.label}
								value={numberFmt.format(s.value)}
							/>
						))}
					</dl>
				</section>

				<section aria-label="Estimated time" className="flex flex-col gap-2">
					<h2 className="text-sm font-medium text-muted-foreground">
						Estimated time
					</h2>
					<dl className="grid gap-3 @xl:grid-cols-2">
						<DurationCard
							label="Reading time"
							value={readTime}
							hint={`~${READING_WPM.average} words/min`}
						/>
						<DurationCard
							label="Speaking time"
							value={speakTime}
							hint={`~${SPEAKING_WPM} words/min`}
						/>
					</dl>
				</section>

				<section aria-label="Character limits" className="flex flex-col gap-2">
					<h2 className="text-sm font-medium text-muted-foreground">
						Character limits
					</h2>
					<dl className="grid gap-2">
						{PLATFORM_LIMITS.map((p) => {
							const remaining = p.limit - counts.characters;
							const over = remaining < 0;
							return (
								<div
									key={p.label}
									className="flex flex-col gap-0.5 rounded-lg border border-border bg-card px-4 py-3 text-sm @sm:flex-row @sm:items-baseline @sm:justify-between @sm:gap-3"
								>
									<dt className="text-muted-foreground">{p.label}</dt>
									<dd className="flex items-baseline gap-2 tabular-nums whitespace-nowrap">
										<span className="font-medium">
											{numberFmt.format(counts.characters)} /{" "}
											{numberFmt.format(p.limit)}
										</span>
										<span
											className={cn(
												"text-xs",
												over ? "text-destructive" : "text-muted-foreground",
											)}
										>
											{over
												? `${numberFmt.format(Math.abs(remaining))} over`
												: `${numberFmt.format(remaining)} left`}
										</span>
									</dd>
								</div>
							);
						})}
					</dl>
				</section>
			</div>
		</div>
	);
}

/** Stat tile showing a formatted duration alongside a words-per-minute hint. */
function DurationCard({
	label,
	value,
	hint,
}: {
	label: string;
	value: string;
	hint: string;
}) {
	return (
		<div className="flex flex-col-reverse gap-1 rounded-lg border border-border bg-card px-4 py-3">
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className="flex items-baseline justify-between gap-2">
				<span className="text-lg font-semibold">{value}</span>
				<span className="shrink-0 text-xs text-muted-foreground">{hint}</span>
			</dd>
		</div>
	);
}
