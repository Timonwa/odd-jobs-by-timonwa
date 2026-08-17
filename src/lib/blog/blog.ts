// Client-safe — no filesystem access, so safe to import from client components. The post list is discovered by lib/blog/loader.ts (server-only); this shape must stay in sync with the frontmatter schema there.

export type PostMeta = {
	slug: string;
	title: string;
	titleAccent: string;
	eyebrow: string;
	description: string;
	keywords: string[];
	category: string;
	readingMinutes: number;
	publishedAt: string;
	updatedAt?: string;
	ogSubtitle: string;
	ogPills: string[];
	ogAccent: string;
	ogBackgroundTint: string;
};

/** Well-known post slugs referenced from app code — single source of truth; each must match a filename in content/blog/. */
export const POST_SLUGS = {
	geminiApiKey: "get-a-gemini-api-key",
} as const;
