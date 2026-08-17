/** Hub-level BYOK constants — one Google Gemini key + model, read from sessionStorage and shared by every AI tool. */

// "-latest" aliases, not pinned versions: Google blocks pinned older models for newly-created keys, which would break BYOK for anyone who just made a key.
export type ByokModel =
	"gemini-flash-lite-latest" | "gemini-flash-latest" | "gemini-pro-latest";

/** Default model used when the user hasn't picked one. */
export const DEFAULT_BYOK_MODEL: ByokModel = "gemini-flash-lite-latest";

export const BYOK_MODELS: {
	value: ByokModel;
	label: string;
	description: string;
}[] = [
	{
		value: "gemini-flash-lite-latest",
		label: "Flash Lite",
		description: "Fastest, cheapest. Highest free tier.",
	},
	{
		value: "gemini-flash-latest",
		label: "Flash",
		description: "Better quality. Lower free tier.",
	},
	{
		value: "gemini-pro-latest",
		label: "Pro",
		description: "Highest quality. Lowest free tier.",
	},
];
