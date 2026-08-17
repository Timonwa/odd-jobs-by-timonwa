// Server-only factory for the MDX content types (blog, newsletter issues, shop).
// Each type passes its content subdir + a Zod frontmatter schema; the loader
// parses/validates frontmatter (failing the build on a mismatch), derives a
// reading-time estimate, and returns typed getAll / getOne / getSlugs helpers.

import "server-only";

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import type { ZodType } from "zod";

import { countWords } from "@/lib/utils/text/counts.utils";
import {
	READING_WPM,
	readingMinutes,
} from "@/lib/utils/text/reading-time.utils";

// A slug is a filename minus `.mdx`; restrict it to a URL-safe allowlist so a
// stray file can never flow into an href as anything but a clean segment.
const SLUG_PATTERN = /^[a-z0-9-]+$/;

type Loaded<T> = T & { slug: string; readingMinutes: number };

type MdxLoaderOptions<T> = {
	/** Subdirectory under `src/content/`, e.g. "blog". */
	dir: string;
	/** Zod schema validating the frontmatter (must mirror the type's `*Meta`). */
	schema: ZodType<T>;
	/** Sort applied by `getAll`; default is newest-first by `publishedAt`. */
	sort?: (a: Loaded<T>, b: Loaded<T>) => number;
};

export function createMdxLoader<T extends { publishedAt: string }>(
	options: MdxLoaderOptions<T>,
) {
	const { dir, schema } = options;
	const CONTENT_DIR = path.join(process.cwd(), "src", "content", dir);
	const sort =
		options.sort ??
		((a: Loaded<T>, b: Loaded<T>) => (a.publishedAt < b.publishedAt ? 1 : -1));

	function read(slug: string): Loaded<T> {
		const raw = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8");
		const { data, content } = matter(raw);
		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			throw new Error(
				`Invalid frontmatter in content/${dir}/${slug}.mdx:\n${parsed.error.message}`,
			);
		}
		// Derived from the body at load time (approximate — counts raw MDX) so it never drifts from the content.
		const minutes = readingMinutes(countWords(content), READING_WPM.average);
		return { slug, ...parsed.data, readingMinutes: minutes };
	}

	function getSlugs(): string[] {
		if (!fs.existsSync(CONTENT_DIR)) return [];
		return fs
			.readdirSync(CONTENT_DIR)
			.filter((file) => file.endsWith(".mdx"))
			.map((file) => file.replace(/\.mdx$/, ""))
			.filter((slug) => SLUG_PATTERN.test(slug));
	}

	function getAll(): Loaded<T>[] {
		return getSlugs().map(read).sort(sort);
	}

	function getOne(slug: string): Loaded<T> | undefined {
		if (!SLUG_PATTERN.test(slug)) return undefined;
		if (!fs.existsSync(path.join(CONTENT_DIR, `${slug}.mdx`))) return undefined;
		return read(slug);
	}

	return { getSlugs, getAll, getOne };
}
