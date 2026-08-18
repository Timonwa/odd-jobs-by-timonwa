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

// A future `publishedAt` means "not yet published", so the entry is withheld
// from listings and the sitemap. Gated the same way drafts are: visible on the
// dev server so scheduled work can be previewed, hidden in any build.
//
// Resolution is a deploy, not a clock: an entry dated tomorrow appears on the
// next build after that date, not the moment it passes. Scheduling a post to go
// live unattended would need ISR or a cron redeploy; this only guarantees a
// future-dated file can't ship early.
//
// Read at module load, not per call, because `cacheComponents` rejects
// `Date.now()` inside a prerendered Server Component — the current time is
// request data there. Module scope is evaluated once, outside any render, which
// is also exactly the semantic above: the cutoff is when the build started.
const CUTOFF_MS = Date.now();

function isPublished(publishedAt: string): boolean {
	if (areDraftsVisible) return true;
	const date = new Date(publishedAt);
	if (Number.isNaN(date.getTime())) return true; // schema-validated; don't hide on a parse quirk
	return date.getTime() <= CUTOFF_MS;
}

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

	function discoverSlugs(): string[] {
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
	const getAll = cache((): Loaded<T>[] => {
		const all = discoverSlugs().map(read);
		const live = all.filter((entry) => isPublished(entry.publishedAt));

		// Next's Cache Components require `generateStaticParams` to return at
		// least one param, so withholding every entry in a section fails the
		// build with an opaque EmptyGenerateStaticParamsError. Say what actually
		// happened instead — the cause (a date) is nowhere near the symptom.
		if (all.length > 0 && live.length === 0) {
			throw new Error(
				`Every entry in content/${dir}/ has a future publishedAt, so the section would build empty and Next requires at least one static param. Backdate one of: ${all
					.map((entry) => `${entry.slug} (${entry.publishedAt})`)
					.join(", ")}.`,
			);
		}

		return live.sort(sort);
	});

	// Derived from getAll rather than the filesystem, so `generateStaticParams`
	// and the sitemap can't disagree with what the listings show.
	const getSlugs = cache((): string[] => getAll().map((entry) => entry.slug));

	const getOne = cache((slug: string): Loaded<T> | undefined => {
		if (!SLUG_PATTERN.test(slug)) return undefined;
		if (!resolveFile(slug)) return undefined;
		const entry = read(slug);
		// 404 rather than serving it: a future-dated entry is excluded from the
		// listings and the sitemap, so a reachable detail page would be an
		// orphan Google could still index from an external link.
		if (!isPublished(entry.publishedAt)) return undefined;
		return entry;
	});

	return { getSlugs, getAll, getOne };
}
