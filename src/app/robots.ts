import type { MetadataRoute } from "next";

import { isProduction } from "@env";

import { SITE_URL } from "@/lib/config/site";

/**
 * Served at /robots.txt. Points crawlers at the sitemap in production, and
 * refuses indexing everywhere else — a preview deploy is a full copy of the
 * site, so without this it can be indexed and compete with production. Vercel
 * sends a noindex header on previews too; this makes the intent explicit rather
 * than relying on the host.
 */
export default function robots(): MetadataRoute.Robots {
	if (!isProduction) return { rules: { userAgent: "*", disallow: "/" } };
	return {
		rules: { userAgent: "*", allow: "/" },
		sitemap: `${SITE_URL}/sitemap.xml`,
		host: SITE_URL,
	};
}
