// Server-only factory for the MDX content types (blog, newsletter issues, shop).
// Each type passes its content subdir + a Zod frontmatter schema; the loader
// parses/validates frontmatter (failing the build on a mismatch), derives a
// reading-time estimate, and returns typed getAll / getOne / getSlugs helpers.

import "server-only";

import fs from "node:fs";
import path from "node:path";

import { cache } from "react";

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

// Work-in-progress lives in `<dir>/_drafts/`, which is gitignored — it never
// reaches the public repo, so it can't be indexed or sitemapped. Reading it
// only under the dev server is what makes a draft previewable locally.
//
// Gated on NODE_ENV, not APP_ENV (the app's usual tier switch): `next build`
// always sets NODE_ENV=production, so no build can emit a draft even if APP_ENV
// is missing — the one thing that must never happen with unpublished writing.
const DRAFTS_DIR_NAME = "_drafts";
const areDraftsVisible = process.env.NODE_ENV === "development";

type Loaded<T> = T & {
	slug: string;
	readingMinutes: number;
	/** Path under the content dir, `<slug>` or `_drafts/<slug>` — what the page's dynamic MDX import interpolates. */
	contentPath: string;
};

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

	const DRAFTS_DIR = path.join(CONTENT_DIR, DRAFTS_DIR_NAME);

	function slugsIn(directory: string): string[] {
		if (!fs.existsSync(directory)) return [];
		return fs
			.readdirSync(directory)
			.filter((file) => file.endsWith(".mdx"))
			.map((file) => file.replace(/\.mdx$/, ""))
			.filter((slug) => SLUG_PATTERN.test(slug));
	}

	function resolveFile(
		slug: string,
	): { file: string; isDraft: boolean } | undefined {
		const published = path.join(CONTENT_DIR, `${slug}.mdx`);
		if (fs.existsSync(published)) return { file: published, isDraft: false };
		if (!areDraftsVisible) return undefined;
		const draft = path.join(DRAFTS_DIR, `${slug}.mdx`);
		if (fs.existsSync(draft)) return { file: draft, isDraft: true };
		return undefined;
	}

	function read(slug: string): Loaded<T> {
		const resolved = resolveFile(slug);
		if (!resolved) throw new Error(`No content file for ${dir}/${slug}.mdx`);
		const raw = fs.readFileSync(resolved.file, "utf8");
		const { data, content } = matter(raw);
		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			throw new Error(
				`Invalid frontmatter in content/${dir}/${slug}.mdx:\n${parsed.error.message}`,
			);
		}
		// Derived from the body at load time (approximate — counts raw MDX) so it never drifts from the content.
		const minutes = readingMinutes(countWords(content), READING_WPM.average);
		return {
			slug,
			...parsed.data,
			readingMinutes: minutes,
			contentPath: resolved.isDraft ? `${DRAFTS_DIR_NAME}/${slug}` : slug,
		};
	}

	function getSlugs(): string[] {
		const published = slugsIn(CONTENT_DIR);
		if (!areDraftsVisible) return published;
		// A published file wins over a same-named draft.
		const drafts = slugsIn(DRAFTS_DIR).filter(
			(slug) => !published.includes(slug),
		);
		return [...published, ...drafts];
	}

	// Memoized per request: the root layout's footer calls getAll() on every
	// route, and each call re-read and re-parsed every MDX file in the directory.
	// `cache` dedupes within one render pass; the files are build-time content, so
	// there is nothing to invalidate inside a request.
	const getAll = cache((): Loaded<T>[] => getSlugs().map(read).sort(sort));

	const getOne = cache((slug: string): Loaded<T> | undefined => {
		if (!SLUG_PATTERN.test(slug)) return undefined;
		if (!resolveFile(slug)) return undefined;
		return read(slug);
	});

	return { getSlugs, getAll, getOne };
}
