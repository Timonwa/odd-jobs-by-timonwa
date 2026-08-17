/** Text case transforms, grouped for the Case Converter UI; programmer cases tokenize first, whole-text cases preserve words in place. */

export type CaseId =
	| "title-ap"
	| "title-chicago"
	| "title-apa"
	| "sentence"
	| "start"
	| "upper"
	| "lower"
	| "camel"
	| "pascal"
	| "snake"
	| "kebab"
	| "constant"
	| "dot"
	| "path"
	| "train"
	| "alternating"
	| "inverse";

const tokens = (input: string): string[] =>
	input
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2") // split camelCase boundaries
		.replace(/[_\-./]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.filter(Boolean);

const cap = (w: string): string =>
	// charAt over w[0]: it returns "" for an empty string rather than undefined.
	w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w;

// Minor words that title-case standards lowercase (unless first/last word).
const ARTICLES = ["a", "an", "the"];
const CONJUNCTIONS = ["and", "but", "or", "nor", "for", "so", "yet"];
const PREPOSITIONS = [
	"as",
	"at",
	"by",
	"in",
	"of",
	"off",
	"on",
	"out",
	"per",
	"to",
	"up",
	"via",
	"from",
	"into",
	"like",
	"near",
	"onto",
	"over",
	"past",
	"than",
	"till",
	"upon",
	"with",
	"about",
	"above",
	"across",
	"after",
	"against",
	"along",
	"amid",
	"among",
	"around",
	"before",
	"behind",
	"below",
	"beneath",
	"beside",
	"between",
	"beyond",
	"during",
	"except",
	"inside",
	"outside",
	"through",
	"toward",
	"under",
	"until",
	"within",
	"without",
];

// AP lowercases articles, coordinating conjunctions, and prepositions of ≤3
// letters. Chicago lowercases those plus prepositions of any length.
const AP_MINOR = new Set([
	...ARTICLES,
	...CONJUNCTIONS,
	...PREPOSITIONS.filter((w) => w.length <= 3),
]);
const CHICAGO_MINOR = new Set([...ARTICLES, ...CONJUNCTIONS, ...PREPOSITIONS]);
// APA uses the same minor-word set as Chicago; it just also capitalizes any word
// of 4+ letters (the `capLongWords` flag), applied before this set is consulted.
const APA_MINOR = CHICAGO_MINOR;

const titleCase = (
	text: string,
	opts: { minor: Set<string>; capLongWords?: boolean; capLast?: boolean },
): string => {
	const trimmed = text.trim();
	if (!trimmed) return "";
	const words = trimmed.split(/\s+/);
	const last = words.length - 1;
	return words
		.map((w, i) => {
			if (i === 0) return cap(w);
			if (opts.capLast && i === last) return cap(w);
			if (opts.capLongWords && w.length >= 4) return cap(w);
			if (opts.minor.has(w.toLowerCase())) return w.toLowerCase();
			return cap(w);
		})
		.join(" ");
};

const TRANSFORMS: Record<CaseId, (text: string) => string> = {
	"title-ap": (t) => titleCase(t, { minor: AP_MINOR, capLast: true }),
	"title-chicago": (t) => titleCase(t, { minor: CHICAGO_MINOR, capLast: true }),
	"title-apa": (t) => titleCase(t, { minor: APA_MINOR, capLongWords: true }),
	sentence: (t) =>
		t
			.toLowerCase()
			.replace(/(^\s*\p{L})|([.!?…]\s+\p{L})/gu, (m) => m.toUpperCase()),
	start: (t) => t.replace(/\p{L}[\p{L}\p{M}']*/gu, cap),
	upper: (t) => t.toUpperCase(),
	lower: (t) => t.toLowerCase(),
	camel: (t) =>
		tokens(t)
			.map((w, i) => (i === 0 ? w.toLowerCase() : cap(w)))
			.join(""),
	pascal: (t) => tokens(t).map(cap).join(""),
	snake: (t) =>
		tokens(t)
			.map((w) => w.toLowerCase())
			.join("_"),
	kebab: (t) =>
		tokens(t)
			.map((w) => w.toLowerCase())
			.join("-"),
	constant: (t) =>
		tokens(t)
			.map((w) => w.toUpperCase())
			.join("_"),
	dot: (t) =>
		tokens(t)
			.map((w) => w.toLowerCase())
			.join("."),
	path: (t) =>
		tokens(t)
			.map((w) => w.toLowerCase())
			.join("/"),
	train: (t) => tokens(t).map(cap).join("-"),
	alternating: (t) => {
		let i = 0;
		return t.replace(/\p{L}/gu, (ch) =>
			i++ % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase(),
		);
	},
	inverse: (t) =>
		t.replace(/\p{L}/gu, (ch) =>
			ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase(),
		),
};

export type CaseOption = {
	id: CaseId;
	label: string;
	icon: string;
	description: string;
};

export type CaseGroup = {
	id: string;
	label: string;
	icon: string;
	cases: CaseOption[];
};

/** All case groups in display order, wiring ids to labels and icons. */
export const CASE_GROUPS: CaseGroup[] = [
	{
		id: "writing",
		label: "Writing styles",
		icon: "✍️",
		cases: [
			{
				id: "title-ap",
				label: "Title Case (AP)",
				icon: "📰",
				description: "News & journalism",
			},
			{
				id: "title-chicago",
				label: "Title Case (Chicago)",
				icon: "📚",
				description: "Books & publishing",
			},
			{
				id: "title-apa",
				label: "APA style",
				icon: "🎓",
				description: "Academic papers",
			},
			{
				id: "sentence",
				label: "Sentence case",
				icon: "💬",
				description: "Standard sentences",
			},
			{
				id: "start",
				label: "Start Case",
				icon: "✨",
				description: "Every Word Caps",
			},
			{ id: "upper", label: "UPPERCASE", icon: "🔠", description: "ALL CAPS" },
			{ id: "lower", label: "lowercase", icon: "🔡", description: "all small" },
		],
	},
	{
		id: "programming",
		label: "Programming styles",
		icon: "💻",
		cases: [
			{
				id: "camel",
				label: "camelCase",
				icon: "🐪",
				description: "JS variables",
			},
			{
				id: "pascal",
				label: "PascalCase",
				icon: "📦",
				description: "Class names",
			},
			{
				id: "snake",
				label: "snake_case",
				icon: "🐍",
				description: "Python/Ruby",
			},
			{
				id: "kebab",
				label: "kebab-case",
				icon: "🍢",
				description: "URLs & CSS",
			},
			{
				id: "constant",
				label: "CONSTANT_CASE",
				icon: "🔒",
				description: "Constants",
			},
			{ id: "dot", label: "dot.case", icon: "⚫", description: "Properties" },
			{ id: "path", label: "path/case", icon: "📁", description: "File paths" },
			{
				id: "train",
				label: "Train-Case",
				icon: "🚂",
				description: "HTTP headers",
			},
		],
	},
	{
		id: "special",
		label: "Special styles",
		icon: "🎨",
		cases: [
			{
				id: "alternating",
				label: "aLtErNaTiNg",
				icon: "🎭",
				description: "Mocking text",
			},
			{
				id: "inverse",
				label: "iNVERSE",
				icon: "🔄",
				description: "Flip the case",
			},
		],
	},
];

/** Apply the named case transform to a string. */
export const convertCase = (text: string, id: CaseId): string =>
	TRANSFORMS[id](text);
