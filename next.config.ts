import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	typedRoutes: true,
	reactCompiler: true,
	pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
	// The Guides section was renamed to Blog; keep old URLs alive (308).
	async redirects() {
		return [
			{ source: "/guides", destination: "/blog", permanent: true },
			{ source: "/guides/:slug", destination: "/blog/:slug", permanent: true },
		];
	},
};

const withMDX = createMDX({
	options: {
		remarkPlugins: ["remark-frontmatter", "remark-gfm"],
	},
});

export default withMDX(nextConfig);
