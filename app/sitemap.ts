import type { MetadataRoute } from "next";

import { TOOL_CATEGORIES } from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { SITE_URL } from "@/lib/config/site";
import { getToolsInCategory, TOOLS } from "@/lib/config/tools";
import { getAllPosts } from "@/lib/server";
import { getAllIssues } from "@/lib/server";

/**
 * Served at /sitemap.xml. The hub home, the tool directory, the categories index
 * plus each non-empty category page, every live tool route (derived from the
 * TOOLS config — "soon" tools are excluded until they ship), the blog index
 * plus every post, the newsletter archive plus every issue, and the shop index
 * (product detail pages canonicalize to www, so they're omitted here).
 */
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: SITE_URL, changeFrequency: "weekly", priority: 1 },
		{
			url: `${SITE_URL}${ROUTES.tools}`,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}${ROUTES.categories}`,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		...TOOL_CATEGORIES.filter((c) => getToolsInCategory(c.id).length > 0).map(
			(c) => ({
				url: `${SITE_URL}${ROUTES.category(c.id)}`,
				changeFrequency: "weekly" as const,
				priority: 0.6,
			}),
		),
		...TOOLS.filter((t) => t.status !== "soon").map((t) => ({
			url: `${SITE_URL}${t.href}`,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
		{
			url: `${SITE_URL}${ROUTES.blog}`,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		...getAllPosts().map((p) => ({
			url: `${SITE_URL}${ROUTES.post(p.slug)}`,
			lastModified: p.updatedAt ?? p.publishedAt,
			changeFrequency: "monthly" as const,
			priority: 0.7,
		})),
		{
			url: `${SITE_URL}${ROUTES.newsletter}`,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		...getAllIssues().map((issue) => ({
			url: `${SITE_URL}${ROUTES.issue(issue.slug)}`,
			lastModified: issue.updatedAt ?? issue.publishedAt,
			changeFrequency: "monthly" as const,
			priority: 0.6,
		})),
		// Shop index only — product detail pages canonicalize to the www listing,
		// so they're intentionally left out of this sitemap.
		{
			url: `${SITE_URL}${ROUTES.shop}`,
			changeFrequency: "weekly",
			priority: 0.7,
		},
	];
}
