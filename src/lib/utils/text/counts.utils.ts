// Text metrics — word, character, sentence, and paragraph counts (the Word Counter tool).

export type TextCounts = {
	characters: number;
	charactersNoSpaces: number;
	words: number;
	sentences: number;
	paragraphs: number;
	lines: number;
};

const codePoints = (text: string): number => [...text].length;

/** Word count — returns 0 for blank/whitespace-only input. */
export const countWords = (text: string): number => {
	const trimmed = text.trim();
	return trimmed ? trimmed.split(/\s+/).length : 0;
};

const countCharacters = (text: string): number => codePoints(text);

const countCharactersNoSpaces = (text: string): number =>
	codePoints(text.replace(/\s/gu, ""));

const countSentences = (text: string): number =>
	text
		.split(/[.!?…]+/u)
		.map((s) => s.trim())
		.filter(Boolean).length;

const countParagraphs = (text: string): number =>
	text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean).length;

const countLines = (text: string): number =>
	text ? text.split(/\r\n|\r|\n/).length : 0;

/** Aggregate all text metrics from a single string. */
export const getTextCounts = (text: string): TextCounts => ({
	characters: countCharacters(text),
	charactersNoSpaces: countCharactersNoSpaces(text),
	words: countWords(text),
	sentences: countSentences(text),
	paragraphs: countParagraphs(text),
	lines: countLines(text),
});
