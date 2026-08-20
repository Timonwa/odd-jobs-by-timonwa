/** Hub-level BYOK constants — one Google Gemini key + model, read from sessionStorage and shared by every AI tool. */

// "-latest" aliases, not pinned versions: Google blocks pinned older models for newly-created keys, which would break BYOK for anyone who just made a key.
export type ByokModel =
	"gemini-flash-lite-latest" | "gemini-flash-latest" | "gemini-pro-latest";

/** Default model used when the user hasn't picked one. */
export const DEFAULT_BYOK_MODEL: ByokModel = "gemini-flash-lite-latest";

/** Model the hosted (platform-key) path runs. Committed rather than env-held:
 * a model id isn't a secret, and holding it in env let staging and production
 * drift onto different models with no review and no allowlist check. */
export const HOSTED_LLM_MODEL: ByokModel = DEFAULT_BYOK_MODEL;

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

export const AI_STUDIO_URL = "https://aistudio.google.com";
export const AI_STUDIO_KEYS_URL = `${AI_STUDIO_URL}/api-keys`;
