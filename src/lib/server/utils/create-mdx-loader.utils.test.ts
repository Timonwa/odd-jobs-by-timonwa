import path from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

// In-memory filesystem — the loader roots itself at `process.cwd()/src/content`,
// so tests register absolute paths under a fake section dir.
const files = new Map<string, string>();
vi.mock("node:fs", () => {
	const dirOf = (p: string) => path.dirname(p);
	return {
		default: {
			existsSync: (p: string) =>
				files.has(p) || [...files.keys()].some((f) => dirOf(f) === p),
			readdirSync: (p: string) =>
				[...files.keys()]
					.filter((f) => dirOf(f) === p)
					.map((f) => path.basename(f)),
			readFileSync: (p: string) => {
				const content = files.get(p);
				if (content === undefined) throw new Error(`ENOENT: ${p}`);
				return content;
			},
		},
	};
});

import { createMdxLoader } from "./create-mdx-loader.utils";

const SECTION = "test-section";
const CONTENT_DIR = path.join(process.cwd(), "src", "content", SECTION);

const schema = z.object({ title: z.string(), publishedAt: z.string() });

const addFile = (name: string, content: string, sub = "") =>
	files.set(path.join(CONTENT_DIR, sub, name), content);

const entry = (title: string, publishedAt: string, body = "Some body text.") =>
	`---\ntitle: ${title}\npublishedAt: "${publishedAt}"\n---\n${body}`;

const makeLoader = () => createMdxLoader({ dir: SECTION, schema });

beforeEach(() => {
	files.clear();
});

describe("createMdxLoader", () => {
	it("loads entries with frontmatter, slug, and derived reading time", () => {
		addFile("first-post.mdx", entry("First", "2026-01-01"));
		const { getOne } = makeLoader();
		const post = getOne("first-post");
		expect(post).toMatchObject({
			slug: "first-post",
			title: "First",
			publishedAt: "2026-01-01",
			contentPath: "first-post",
		});
		expect(post?.readingMinutes).toBeGreaterThanOrEqual(1);
	});

	it("sorts getAll newest-first by default", () => {
		addFile("older.mdx", entry("Older", "2025-01-01"));
		addFile("newer.mdx", entry("Newer", "2026-01-01"));
		const { getAll } = makeLoader();
		expect(getAll().map((p) => p.slug)).toEqual(["newer", "older"]);
	});

	// The slug flows into a dynamic import path and hrefs — anything outside the
	// `^[a-z0-9-]+$` allowlist must be refused before it touches the filesystem.
	it.each(["../secrets", "a/b", "UPPER", "dot.dot", "sp ace", ""])(
		"getOne refuses non-allowlisted slug %j",
		(slug) => {
			addFile("real.mdx", entry("Real", "2026-01-01"));
			const { getOne } = makeLoader();
			expect(getOne(slug)).toBeUndefined();
		},
	);

	it("excludes files whose names fail the slug allowlist from discovery", () => {
		addFile("good-one.mdx", entry("Good", "2026-01-01"));
		addFile("Bad_Name.mdx", entry("Bad", "2026-01-01"));
		const { getSlugs } = makeLoader();
		expect(getSlugs()).toEqual(["good-one"]);
	});

	it("throws loudly on invalid frontmatter instead of shipping a broken page", () => {
		addFile("broken.mdx", `---\ntitle: 42\n---\nBody`);
		const { getOne } = makeLoader();
		expect(() => getOne("broken")).toThrow(/Invalid frontmatter/);
	});

	it("does not mistake a --- rule inside the body for the terminator", () => {
		addFile(
			"with-rule.mdx",
			`---\ntitle: Rule\npublishedAt: "2026-01-01"\n---\nBefore\n\n---\n\nAfter`,
		);
		const { getOne } = makeLoader();
		expect(getOne("with-rule")?.title).toBe("Rule");
	});

	it("strips a UTF-8 BOM before parsing frontmatter", () => {
		addFile("bom.mdx", `﻿${entry("Bom", "2026-01-01")}`);
		const { getOne } = makeLoader();
		expect(getOne("bom")?.title).toBe("Bom");
	});

	// NODE_ENV is "test" under Vitest — a build, not the dev server — so drafts
	// and future-dated entries must be invisible.
	it("never serves drafts outside the dev server", () => {
		addFile("published.mdx", entry("Published", "2026-01-01"));
		addFile("secret-draft.mdx", entry("Draft", "2026-01-01"), "_drafts");
		const { getAll, getOne } = makeLoader();
		expect(getAll().map((p) => p.slug)).toEqual(["published"]);
		expect(getOne("secret-draft")).toBeUndefined();
	});

	it("withholds future-dated entries from listings and detail pages", () => {
		addFile("live.mdx", entry("Live", "2026-01-01"));
		addFile("scheduled.mdx", entry("Scheduled", "2999-01-01"));
		const { getAll, getOne } = makeLoader();
		expect(getAll().map((p) => p.slug)).toEqual(["live"]);
		expect(getOne("scheduled")).toBeUndefined();
	});

	it("fails the build with a named cause when every entry is future-dated", () => {
		addFile("scheduled.mdx", entry("Scheduled", "2999-01-01"));
		const { getAll } = makeLoader();
		expect(() => getAll()).toThrow(/future publishedAt/);
	});

	it("returns undefined for a missing entry", () => {
		const { getOne } = makeLoader();
		expect(getOne("nope")).toBeUndefined();
	});
});
