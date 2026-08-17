import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/config/site";

/**
 * Web app manifest (Next.js metadata route). Served at `/manifest.webmanifest`
 * and linked into <head> automatically. Icons live in `public/` so they have
 * stable URLs the manifest can point to.
 */
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: SITE_NAME,
		short_name: "The Prod Bug",
		description: SITE_DESCRIPTION,
		id: "/",
		start_url: "/",
		scope: "/",
		display: "standalone",
		orientation: "portrait",
		lang: "en",
		dir: "ltr",
		categories: ["productivity", "utilities"],
		theme_color: "#4472e3",
		background_color: "#ffffff",
		icons: [
			{
				src: "/android-chrome-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/android-chrome-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
