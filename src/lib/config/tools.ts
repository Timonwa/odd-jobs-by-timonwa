// The tool registry — one entry per tool wiring it into the home grid, navbar, and sitemap.

import type { Route } from "next";
import {
	CaseSensitiveIcon,
	ClockIcon,
	CodeXmlIcon,
	FingerprintIcon,
	LinkIcon,
	PilcrowIcon,
	SearchIcon,
	Share2Icon,
	WholeWordIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import type { CategoryId } from "./categories";
import { ROUTES } from "./routes";

export type Tool = {
	slug: string;
	name: string;
	tagline: string;
	href: Route;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	categories: CategoryId[];
	featured?: boolean;
	status?: "live" | "soon";
};

const RAW_TOOLS: Omit<Tool, "href">[] = [
	{
		slug: "article-to-social-posts",
		name: "Article to Social Posts",
		tagline: "Turn articles into platform-optimized social media posts.",
		icon: Share2Icon,
		categories: ["writing", "ai"],
		featured: true,
		status: "live",
	},
	{
		slug: "article-to-seo-meta",
		name: "Article to SEO Meta",
		tagline:
			"Generate SEO-friendly title and description variations with character counts in spec.",
		icon: SearchIcon,
		categories: ["writing", "ai", "seo"],
		featured: true,
		status: "live",
	},
	{
		slug: "word-counter",
		name: "Word & Character Counter",
		tagline:
			"Live word, character, sentence, and reading-time counts, with platform character limits.",
		icon: WholeWordIcon,
		categories: ["writing", "seo"],
		featured: true,
		status: "live",
	},
	{
		slug: "svg-to-jsx",
		name: "SVG to JSX Converter",
		tagline: "Convert raw SVG markup into a clean React/JSX component.",
		icon: CodeXmlIcon,
		categories: ["developer"],
		featured: true,
		status: "live",
	},
	{
		slug: "hash-generator",
		name: "Hash Generator",
		tagline:
			"Hash text with SHA-1, SHA-256, SHA-384, and SHA-512 in your browser.",
		icon: FingerprintIcon,
		categories: ["developer"],
		featured: true,
		status: "live",
	},
	{
		slug: "slug-generator",
		name: "Slug Generator",
		tagline: "Turn any title or headline into a clean, URL-safe slug.",
		icon: LinkIcon,
		categories: ["writing", "seo", "developer"],
		status: "live",
	},
	{
		slug: "reading-time",
		name: "Reading Time Estimator",
		tagline:
			"Estimate reading and speaking time, with a copy-ready “X min read” label.",
		icon: ClockIcon,
		categories: ["writing"],
		status: "live",
	},
	{
		slug: "case-converter",
		name: "Case Converter",
		tagline:
			"Switch text between UPPERCASE, Title Case, camelCase, snake_case, and more.",
		icon: CaseSensitiveIcon,
		categories: ["writing", "developer"],
		featured: true,
		status: "live",
	},
	{
		slug: "lorem-ipsum",
		name: "Lorem Ipsum Generator",
		tagline:
			"Generate placeholder paragraphs, sentences, or words in one click.",
		icon: PilcrowIcon,
		categories: ["developer", "writing"],
		status: "live",
	},
];

/** Every tool, alphabetical by name — the order every grid and list renders in. */
export const TOOLS: Tool[] = RAW_TOOLS.map((tool) => ({
	...tool,
	href: ROUTES.tool(tool.slug),
})).sort((a, b) => a.name.localeCompare(b.name));

/** Live tools only (excludes "soon"), for grids, the directory, and previews. */
export const LIVE_TOOLS: Tool[] = TOOLS.filter((t) => t.status !== "soon");

/** The curated set shown on the home page (falls back to nothing if unset). */
export const FEATURED_TOOLS: Tool[] = LIVE_TOOLS.filter((t) => t.featured);

/** A tool's primary category id — the first one, shown in its breadcrumb. Resolve to the full category via `getCategory`. */
export const getPrimaryCategoryId = (tool: Tool): CategoryId =>
	tool.categories[0];

/** Live tools that belong to a category (alphabetical, following TOOLS). */
export const getToolsInCategory = (category: CategoryId): Tool[] =>
	LIVE_TOOLS.filter((t) => t.categories.includes(category));

/** Look up a tool by slug (e.g. to build a tool page's breadcrumb). */
export const getToolBySlug = (slug: string): Tool | undefined =>
	TOOLS.find((t) => t.slug === slug);

/**
 * Tools to suggest below a tool page: live tools that share a category with it,
 * primary-category matches first, then any other shared category. If fewer than
 * `max` share a category, the rest of the live tools backfill so the grid is
 * never sparse. Within each group, alphabetical order (from TOOLS) is kept.
 */
export const getRelatedTools = (slug: string, max = 3): Tool[] => {
	const current = getToolBySlug(slug);
	const pool = LIVE_TOOLS.filter((t) => t.slug !== slug);
	if (!current) return pool.slice(0, max);

	const sharesCategory = (t: Tool) =>
		t.categories.some((c) => current.categories.includes(c));
	const sharesPrimary = (t: Tool) =>
		t.categories.includes(current.categories[0]);

	const related = pool
		.filter(sharesCategory)
		.sort((a, b) => Number(sharesPrimary(b)) - Number(sharesPrimary(a)));
	const backfill = pool.filter((t) => !sharesCategory(t));

	return [...related, ...backfill].slice(0, max);
};
