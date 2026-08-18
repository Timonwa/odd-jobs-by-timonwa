// Guards for a tool's SEO content (`content/tools/<slug>.mdx`).
//
// Tool copy is the one content type with no frontmatter — each file exports a
// `faq` const — so `createMdxLoader` has nothing to parse and these files get no
// loader. What that leaves missing is exactly what's here: the slug is checked
// before it's interpolated into a dynamic import, and `faq` is validated before
// it becomes FAQPage JSON-LD.
//
// Client-safe rather than under `lib/server/`, for two reasons: both functions
// are pure (a registry lookup and a schema parse — no env, no fs, no secrets),
// and a `server-only` import here made Turbopack trace the whole project and
// then mis-attribute every server module in the graph to the Pages Router. The
// `import()` stays at the component boundary, which is the only place a
// template-literal MDX import resolves cleanly.

import { getToolBySlug } from "@/lib/config/tools";
import { ToolFaqSchema, type ToolFaqEntry } from "@/lib/schemas";

/** Narrows a string to a registered tool slug before it reaches a dynamic import path — a registry check, since the valid set is already declared once in `TOOLS`. */
export function assertToolSlug(slug: string): string {
	if (!getToolBySlug(slug)) {
		throw new Error(`No tool registered for slug "${slug}"`);
	}
	return slug;
}

/** Validates a tool MDX module's `faq` export. Throws rather than degrading: a malformed entry would publish broken FAQPage structured data, and no caller can render without it. */
export function parseToolFaq(slug: string, faq: unknown): ToolFaqEntry[] {
	const parsed = ToolFaqSchema.safeParse(faq);
	if (!parsed.success) {
		throw new Error(
			`Invalid \`faq\` export in content/tools/${slug}.mdx:\n${parsed.error.message}`,
		);
	}
	return parsed.data;
}
