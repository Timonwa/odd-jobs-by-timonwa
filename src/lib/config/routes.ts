// Typed route path builders for every page in the app.

import type { Route } from "next";

/**
 * Internal app routes — registered once and reused across the navbar, footer,
 * in-app links, metadata, and the sitemap. Off-site / brand links live in
 * lib/config/site.ts; each tool's own route is its `href` in lib/config/tools.ts.
 */
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
