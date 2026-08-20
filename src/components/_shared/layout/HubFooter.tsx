import { HeartIcon, WrenchIcon } from "lucide-react";

import { Footer, GithubMark, LinkedInLogo, XLogo } from "@/components/ui";
import { FOOTER_LEGAL_LINKS, FOOTER_META_LINKS } from "@/lib/constants";
import { ROUTES } from "@/lib/config/routes";
import { TOOLS } from "@/lib/config/tools";
import { getAllPosts, getAllProducts } from "@/lib/server";
import { siteConfig } from "@/lib/config/site";
import { EXTERNAL_ROUTES } from "@/lib/config/routes";

// Resolved at module load so it stays static under Cache Components — the copyright year doesn't need request-time freshness.
const YEAR = new Date().getFullYear();

const SOCIAL_LINKS = [
	{ label: "Star on GitHub", href: EXTERNAL_ROUTES.repo, icon: GithubMark },
	{
		label: `${siteConfig.creator.name} on X`,
		href: siteConfig.creator.twitterUrl,
		icon: XLogo,
	},
	{
		label: `${siteConfig.creator.name} on LinkedIn`,
		href: siteConfig.creator.linkedinUrl,
		icon: LinkedInLogo,
	},
	{
		label: "Support these free tools",
		href: EXTERNAL_ROUTES.support,
		icon: HeartIcon,
	},
];

/** This app's footer — builds the link columns from the tools registry and the content loaders, then renders the Footer shell. */
export function HubFooter() {
	// Cap each list so no column runs long; the "All …" link covers the rest.
	const tools = TOOLS.filter((tool) => tool.status !== "soon").slice(0, 5);
	const posts = getAllPosts().slice(0, 4);
	const products = getAllProducts().slice(0, 4);

	const columns = [
		{
			heading: "Tools",
			links: [
				{ label: "All tools", href: ROUTES.tools },
				...tools.map((tool) => ({ label: tool.name, href: tool.href })),
			],
		},
		{
			heading: "Blog",
			links: [
				{ label: "All posts", href: ROUTES.blog },
				...posts.map((post) => ({
					label: post.title,
					href: ROUTES.post(post.slug),
				})),
			],
		},
		{
			heading: "Shop",
			links: [
				{ label: "All products", href: ROUTES.shop },
				...products.map((product) => ({
					label: product.title,
					href: ROUTES.product(product.slug),
				})),
			],
		},
		{
			heading: "Explore",
			links: [
				{ label: "Newsletter", href: ROUTES.newsletter },
				{ label: "Categories", href: ROUTES.categories },
				{
					label: "Support",
					href: EXTERNAL_ROUTES.support,
					isExternal: true as const,
				},
				{
					label: "Star on GitHub",
					href: EXTERNAL_ROUTES.repo,
					isExternal: true as const,
				},
				{
					label: "Report an issue",
					href: `${EXTERNAL_ROUTES.repo}/issues`,
					isExternal: true as const,
				},
			],
		},
	];

	return (
		<Footer
			brand={{ href: ROUTES.home, name: siteConfig.name, icon: WrenchIcon }}
			tagline={siteConfig.tagline}
			socialLinks={SOCIAL_LINKS}
			columns={columns}
			metaLinks={FOOTER_META_LINKS.map((link) => ({
				...link,
				isExternal: true as const,
			}))}
			legalLinks={FOOTER_LEGAL_LINKS.map((link) => ({
				...link,
				isExternal: true as const,
			}))}
			bottomNote={
				<p>
					© {YEAR}{" "}
					<a
						href={siteConfig.creator.url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
					>
						{siteConfig.creator.name}
					</a>{" "}
					· <span className="font-medium text-primary">{siteConfig.name}</span>{" "}
					is open source.
				</p>
			}
		/>
	);
}
