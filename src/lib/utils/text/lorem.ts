/** The granularity of lorem ipsum output. */
export type LoremUnit = "paragraphs" | "sentences" | "words";

export type LoremOptions = {
	unit: LoremUnit;
	count: number;
	startWithLorem?: boolean;
};

const WORDS = [
	"lorem",
	"ipsum",
	"dolor",
	"sit",
	"amet",
	"consectetur",
	"adipiscing",
	"elit",
	"sed",
	"do",
	"eiusmod",
	"tempor",
	"incididunt",
	"ut",
	"labore",
	"et",
	"dolore",
	"magna",
	"aliqua",
	"enim",
	"ad",
	"minim",
	"veniam",
	"quis",
	"nostrud",
	"exercitation",
	"ullamco",
	"laboris",
	"nisi",
	"aliquip",
	"ex",
	"ea",
	"commodo",
	"consequat",
	"duis",
	"aute",
	"irure",
	"in",
	"reprehenderit",
	"voluptate",
	"velit",
	"esse",
	"cillum",
	"fugiat",
	"nulla",
	"pariatur",
	"excepteur",
	"sint",
	"occaecat",
	"cupidatat",
	"non",
	"proident",
	"sunt",
	"culpa",
	"qui",
	"officia",
	"deserunt",
	"mollit",
	"anim",
	"id",
	"est",
	"laborum",
	"perspiciatis",
	"unde",
	"omnis",
	"iste",
	"natus",
	"error",
	"voluptatem",
	"accusantium",
	"doloremque",
	"laudantium",
	"totam",
	"rem",
	"aperiam",
	"eaque",
	"ipsa",
	"quae",
	"ab",
	"illo",
	"inventore",
	"veritatis",
	"quasi",
	"architecto",
	"beatae",
	"vitae",
	"dicta",
	"explicabo",
];

const LOREM_START = ["lorem", "ipsum", "dolor", "sit", "amet"];

const randInt = (min: number, max: number, random: () => number) =>
	Math.floor(random() * (max - min + 1)) + min;

const capitalize = (text: string) =>
	text.charAt(0).toUpperCase() + text.slice(1);

function randomWords(n: number, random: () => number): string[] {
	const out: string[] = [];
	for (let i = 0; i < n; i++) {
		out.push(WORDS[randInt(0, WORDS.length - 1, random)]);
	}
	return out;
}

function makeSentence(random: () => number, lead?: string[]): string {
	const length = randInt(6, 14, random);
	const words = lead
		? [...lead, ...randomWords(Math.max(1, length - lead.length), random)]
		: randomWords(length, random);
	// A comma in longer sentences reads more naturally than a flat word run.
	if (words.length > 8) {
		const commaAt = randInt(2, words.length - 3, random);
		words[commaAt] = `${words[commaAt]},`;
	}
	return `${capitalize(words.join(" "))}.`;
}

function makeParagraph(random: () => number, lead?: string[]): string {
	const sentences = randInt(3, 6, random);
	return Array.from({ length: sentences }, (_, i) =>
		makeSentence(random, i === 0 ? lead : undefined),
	).join(" ");
}

/** Lorem ipsum generator; `random` is injectable so output can be seeded in tests. */
export function generateLorem(
	options: LoremOptions,
	random: () => number = Math.random,
): string {
	const count = Math.max(1, Math.floor(options.count));
	const lead = options.startWithLorem ? LOREM_START : undefined;

	if (options.unit === "words") {
		const words = lead
			? [...lead, ...randomWords(Math.max(1, count - lead.length), random)]
			: randomWords(count, random);
		return `${capitalize(words.slice(0, count).join(" "))}.`;
	}

	if (options.unit === "sentences") {
		return Array.from({ length: count }, (_, i) =>
			makeSentence(random, i === 0 ? lead : undefined),
		).join(" ");
	}

	return Array.from({ length: count }, (_, i) =>
		makeParagraph(random, i === 0 ? lead : undefined),
	).join("\n\n");
}
