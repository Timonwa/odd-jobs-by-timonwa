// Resolves a tool's platform-side (server) Gemini API key — per-tool key, hub fallback. Distinct from a user's BYOK key.

import { env } from "@env";

/** Resolves the platform (server) Gemini key for a tool — per-tool key preferred (separate AI Studio metrics per tool), falls back to the hub-level `GOOGLE_API_KEY`. A blank/whitespace per-tool value counts as absent (env files often set it to ""), so it still falls back. Fed to `createGeminiClient` as `serverKey`; never the user's BYOK key. */
export const resolvePlatformApiKey = (perToolKey?: string) =>
	perToolKey?.trim() || env.GOOGLE_API_KEY;
