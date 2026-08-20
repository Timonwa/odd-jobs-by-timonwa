// Typed route path builders for every page in the app.

import type { Route } from "next";

import { siteConfig } from "./site";

// Barrel — the app's client-safe settings.
export const ROUTES = {
	home: "/" as Route,
	tools: "/tools" as Route,
	categories: "/categories" as Route,
	category: (id: string): Route =>
		`/categories/${encodeURIComponent(id)}` as Route,
	toolsCategory: (category: string): Route =>
		`/tools?category=${encodeURIComponent(category)}` as Route,
	tool: (slug: string): Route => `/${encodeURIComponent(slug)}` as Route,
	blog: "/blog" as Route,
	post: (slug: string): Route => `/blog/${encodeURIComponent(slug)}` as Route,
	newsletter: "/newsletter" as Route,
	issue: (slug: string): Route =>
		`/newsletter/${encodeURIComponent(slug)}` as Route,
	shop: "/shop" as Route,
	product: (slug: string): Route =>
		`/shop/${encodeURIComponent(slug)}` as Route,
};

// Separate from ROUTES because these are plain strings, not typedRoutes `Route`s.
export const EXTERNAL_ROUTES = {
	repo: "https://github.com/Timonwa/odd-jobs-by-timonwa",
	support: `${siteConfig.creator.siteUrl}/support`,
	terms: `${siteConfig.creator.siteUrl}/terms`,
	privacy: `${siteConfig.creator.siteUrl}/privacy`,
	shopCanonicalBase: `${siteConfig.creator.siteUrl}/shop`,
} as const;
