import { HeartIcon, WrenchIcon } from "lucide-react";

import { Footer, GithubMark, LinkedInLogo, XLogo } from "@/components/ui";
import { FOOTER_LEGAL_LINKS, FOOTER_META_LINKS } from "@/lib/constants";
import { ROUTES } from "@/lib/config/routes";
import {
	CREATOR_LINKEDIN_URL,
	CREATOR_NAME,
	CREATOR_TWITTER_URL,
	CREATOR_URL,
	REPO_URL,
	SITE_NAME,
	SITE_TAGLINE,
	SUPPORT_URL,
} from "@/lib/config/site";
import { TOOLS } from "@/lib/config/tools";
import { getAllPosts, getAllProducts } from "@/lib/server";

// Resolved at module load so it stays static under Cache Components — the copyright year doesn't need request-time freshness.
const YEAR = new Date().getFullYear();

const SOCIAL_LINKS = [
	{ label: "Star on GitHub", href: REPO_URL, icon: GithubMark },
	{ label: `${CREATOR_NAME} on X`, href: CREATOR_TWITTER_URL, icon: XLogo },
	{
		label: `${CREATOR_NAME} on LinkedIn`,
		href: CREATOR_LINKEDIN_URL,
		icon: LinkedInLogo,
	},
	{ label: "Support these free tools", href: SUPPORT_URL, icon: HeartIcon },
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
				{ label: "Support", href: SUPPORT_URL, isExternal: true as const },
				{
					label: "Star on GitHub",
					href: REPO_URL,
					isExternal: true as const,
				},
				{
					label: "Report an issue",
					href: `${REPO_URL}/issues`,
					isExternal: true as const,
				},
			],
		},
	];

	return (
		<Footer
			brand={{ href: ROUTES.home, name: SITE_NAME, icon: WrenchIcon }}
			tagline={SITE_TAGLINE}
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
						href={CREATOR_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
					>
						{CREATOR_NAME}
					</a>{" "}
					· <span className="font-medium text-primary">{SITE_NAME}</span> is
					open source.
				</p>
			}
		/>
	);
}
