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
	/** Sequential issue number, shown as "Issue #N" when present. */
	issueNumber: z.number().optional(),
	/** The email subject line the issue went out with. */
	subject: z.string(),
	/** Inbox preview text. */
	preview: z.string(),
	ogSubtitle: z.string(),
	ogPills: z.array(z.string()),
	ogAccent: z.string(),
	ogBackgroundTint: z.string(),
});

/** A loaded issue — frontmatter plus the slug and derived reading time. */
export type IssueMetaType = z.infer<typeof IssueFrontmatterSchema> & {
	slug: string;
	readingMinutes: number;
};
