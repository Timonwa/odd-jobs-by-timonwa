// Estimates reading time from word count at configurable reading speeds.

export const READING_WPM = {
	slow: 150,
	average: 225,
	fast: 300,
} as const;

export type ReadingSpeed = keyof typeof READING_WPM;

/** Fixed conversational speaking pace in words-per-minute. */
export const SPEAKING_WPM = 130;

/** Whole-minute reading estimate (rounded, min 1 for any non-empty text). */
export const readingMinutes = (words: number, wpm: number): number =>
	words <= 0 ? 0 : Math.max(1, Math.round(words / wpm));

/** Precise duration in seconds — feeds the "X min Y sec" label. */
export const durationSeconds = (words: number, wpm: number): number =>
	words <= 0 ? 0 : Math.round((words / wpm) * 60);

/** Human-readable duration string from a total seconds value. */
export const formatDuration = (totalSeconds: number): string => {
	if (totalSeconds <= 0) return "0 sec";
	const mins = Math.floor(totalSeconds / 60);
	const secs = totalSeconds % 60;
	if (mins === 0) return `${secs} sec`;
	if (secs === 0) return `${mins} min`;
	return `${mins} min ${secs} sec`;
};
