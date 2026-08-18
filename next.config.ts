import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// Content-Security-Policy, set here rather than in middleware — this app has no
// middleware, and a static header costs nothing per request.
//
// `'unsafe-inline'` on script-src is required today, not sloppiness: the root
// layout ships an inline theme script (it must run before paint to avoid a
// flash of the wrong theme) and Next injects inline bootstrap scripts. Moving to
// a nonce means a middleware that makes every response dynamic, which would
// forfeit the static rendering this site relies on. `'unsafe-eval'` is
// deliberately absent.
const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://cloud.umami.is",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob:",
	"font-src 'self' data:",
	// Gemini is called server-side, so the browser only ever talks to us and the
	// analytics collector.
	"connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev",
	"frame-src https://www.youtube-nocookie.com",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
	{ key: "Content-Security-Policy", value: CSP },
	// Defence in depth behind `frame-ancestors` for older browsers.
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	// The app asks for none of these, so deny them rather than leaving the
	// browser's defaults to decide.
	{
		key: "Permissions-Policy",
		value: "camera=(), microphone=(), geolocation=(), payment=()",
	},
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
	{ key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
	cacheComponents: true,
	typedRoutes: true,
	reactCompiler: true,
	pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
	images: {
		// AVIF first, WebP second: Next negotiates per request, so older browsers
		// still get WebP. Screenshots are the heaviest thing the blog serves.
		formats: ["image/avif", "image/webp"],
		// No `remotePatterns` on purpose — every image ships with the repo, so the
		// optimizer can never be pointed at an attacker-chosen origin.
	},
	// The Guides section was renamed to Blog; keep old URLs alive (308).
	async redirects() {
		return [
			{ source: "/guides", destination: "/blog", permanent: true },
			{ source: "/guides/:slug", destination: "/blog/:slug", permanent: true },
		];
	},
	async headers() {
		return [{ source: "/:path*", headers: SECURITY_HEADERS }];
	},
};

const withMDX = createMDX({
	options: {
		remarkPlugins: ["remark-frontmatter", "remark-gfm"],
	},
});

export default withMDX(nextConfig);
