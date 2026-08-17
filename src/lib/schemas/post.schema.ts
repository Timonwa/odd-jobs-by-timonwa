// Blog post frontmatter — validated at load time so a malformed or incomplete
// file fails the build loudly instead of shipping a broken page.

import { z } from "zod";

export const PostFrontmatterSchema = z.object({
	title: z.string(),
	titleAccent: z.string(),
	eyebrow: z.string(),
	description: z.string(),
	keywords: z.array(z.string()),
	category: z.string(),
	publishedAt: z.string(),
	updatedAt: z.string().optional(),
	ogSubtitle: z.string(),
	ogPills: z.array(z.string()),
	ogAccent: z.string(),
	ogBackgroundTint: z.string(),
});

/** A loaded post — frontmatter plus the slug and derived reading time. */
export type PostMetaType = z.infer<typeof PostFrontmatterSchema> & {
	slug: string;
	readingMinutes: number;
};
