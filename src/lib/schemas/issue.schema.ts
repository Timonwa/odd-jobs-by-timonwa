// Newsletter issue frontmatter — validated at load time so a malformed or
// incomplete file fails the build loudly instead of shipping a broken page.

import { z } from "zod";

export const IssueFrontmatterSchema = z.object({
	title: z.string(),
	titleAccent: z.string(),
	eyebrow: z.string(),
	description: z.string(),
	keywords: z.array(z.string()),
	category: z.string(),
	publishedAt: z.string(),
	updatedAt: z.string().optional(),
	subject: z.string(),
	/** Inbox preview text. */
	preview: z.string(),
});

/** A loaded issue — frontmatter plus the slug and derived reading time. */
export type IssueMeta = z.infer<typeof IssueFrontmatterSchema> & {
	slug: string;
	readingMinutes: number;
	/** Path under the content dir — `<slug>` or `_drafts/<slug>`; only drafts differ. */
	contentPath: string;
	isDraft: boolean;
	issueNumber: number;
};
