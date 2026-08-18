import { z } from "zod";

// Tool SEO copy is the one content type with no YAML frontmatter: each
// `content/tools/<slug>.mdx` exports a `faq` const instead, so gray-matter (and
// therefore `createMdxLoader`) has nothing to read. This schema is what stands
// in for frontmatter validation — the FAQ feeds FAQPage JSON-LD, so a malformed
// entry would publish broken structured data rather than just render oddly.

export const ToolFaqEntrySchema = z.object({
	question: z.string().min(1),
	answer: z.string().min(1),
});

export const ToolFaqSchema = z.array(ToolFaqEntrySchema).min(1);

export type ToolFaqEntry = z.infer<typeof ToolFaqEntrySchema>;
