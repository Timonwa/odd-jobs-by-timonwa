import type { MetadataRoute } from "next";

import { TOOL_CATEGORIES } from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { getToolsInCategory, TOOLS } from "@/lib/config/tools";
import { getAllPosts, getAllIssues } from "@/lib/server";
import { siteConfig } from "@/lib/config/site";
/**
 * Served at /sitemap.xml. The hub home, the tool directory, the categories index
 * plus each non-empty category page, every live tool route (derived from the
 * TOOLS config — "soon" tools are excluded until they ship), the blog index
 * plus every post, and the newsletter archive plus every issue.
 * The shop is excluded entirely — it duplicates the www listing and
 * canonicalizes there.
 */
// Static pages have no content date of their own, so they carry the build date:
// a deploy is the only thing that can change them, and an absent lastModified
// tells a crawler less than an approximate one.
const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
	// The shop is deliberately absent — index and product pages alike. Every page
	// in it duplicates the authoritative listing on www.timonwa.com and
	// canonicalizes there, so sitemapping it would ask Google to index pages we
	// have already told it to ignore.
	return [
		{ url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
		{
			url: `${siteConfig.url}${ROUTES.tools}`,
			lastModified: BUILD_DATE,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${siteConfig.url}${ROUTES.categories}`,
			lastModified: BUILD_DATE,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		...TOOL_CATEGORIES.filter((c) => getToolsInCategory(c.id).length > 0).map(
			(c) => ({
				url: `${siteConfig.url}${ROUTES.category(c.id)}`,
				changeFrequency: "weekly" as const,
				priority: 0.6,
			}),
		),
		...TOOLS.filter((t) => t.status !== "soon").map((t) => ({
			url: `${siteConfig.url}${t.href}`,
			lastModified: BUILD_DATE,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
		{
			url: `${siteConfig.url}${ROUTES.blog}`,
			lastModified: BUILD_DATE,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		...getAllPosts().map((p) => ({
			url: `${siteConfig.url}${ROUTES.post(p.slug)}`,
			lastModified: p.updatedAt ?? p.publishedAt,
			changeFrequency: "monthly" as const,
			priority: 0.7,
		})),
		{
			url: `${siteConfig.url}${ROUTES.newsletter}`,
			lastModified: BUILD_DATE,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		...getAllIssues().map((issue) => ({
			url: `${siteConfig.url}${ROUTES.issue(issue.slug)}`,
			lastModified: issue.updatedAt ?? issue.publishedAt,
			changeFrequency: "monthly" as const,
			priority: 0.6,
		})),
	];
}
