// Client-safe — no filesystem access, so safe to import from client components. The issue list is discovered by lib/issues/loader.ts (server-only); this shape must stay in sync with the frontmatter schema there.

export type IssueMeta = {
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
	/** Sequential issue number, shown as "Issue #N" when present. */
	issueNumber?: number;
	/** The email subject line the issue went out with. */
	subject: string;
	/** Inbox preview text. */
	preview: string;
	ogSubtitle: string;
	ogPills: string[];
	ogAccent: string;
	ogBackgroundTint: string;
};
