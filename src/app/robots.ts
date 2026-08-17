import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config/site";

/** Served at /robots.txt. Allow everything; point crawlers at the sitemap. */
export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/" },
		sitemap: `${SITE_URL}/sitemap.xml`,
		host: SITE_URL,
	};
}
