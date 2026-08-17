import { HeartIcon, WrenchIcon } from "lucide-react";
import Link from "next/link";

import { GithubMark, LinkedInLogo, XLogo } from "@/components/ui/logos";
import { Tooltip } from "@/components/ui";
import {
	CREATOR_NAME,
	CREATOR_BLOG_URL,
	CREATOR_LINKEDIN_URL,
	CREATOR_SITE_URL,
	CREATOR_TWITTER_URL,
	CREATOR_URL,
	PRIVACY_URL,
	REPO_URL,
	SITE_NAME,
	SITE_TAGLINE,
	SUPPORT_URL,
	TERMS_URL,
} from "@/lib/config/site";
import { TOOLS } from "@/lib/config/tools";
import { ROUTES } from "@/lib/config/routes";
import { getAllPosts } from "@/lib/blog/loader";
import { getAllProducts } from "@/lib/shop/loader";

// Creator cross-links — a single compact row in the bottom bar (rather than
// their own column) so the nav grid stays roomy.
const META_LINKS = [
	{ href: CREATOR_SITE_URL, label: "Main site" },
	{ href: CREATOR_BLOG_URL, label: "Dev blog" },
	{ href: CREATOR_URL, label: "All my links" },
];

const LEGAL_LINKS = [
	{ href: TERMS_URL, label: "Terms" },
	{ href: PRIVACY_URL, label: "Privacy" },
];

// Resolved at module load so it stays static under Cache Components — the copyright year doesn't need request-time freshness.
const YEAR = new Date().getFullYear();

const linkClass =
	"text-muted-foreground transition-colors hover:text-foreground";

const iconLinkClass =
	"flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

/** A footer nav column — heading plus a capped list of internal links. */
function FooterColumn({
	heading,
	children,
}: {
	heading: string;
	children: React.ReactNode;
}) {
	const id = `footer-${heading.toLowerCase()}-heading`;
	return (
		<nav aria-labelledby={id}>
			<h2 id={id} className="text-sm font-semibold text-foreground">
				{heading}
			</h2>
			<ul className="mt-3 flex flex-col gap-2 text-sm">{children}</ul>
		</nav>
	);
}

export default function Footer() {
	// Cap each list so no column runs long; the "All …" link covers the rest.
	const tools = TOOLS.filter((tool) => tool.status !== "soon").slice(0, 5);
	const posts = getAllPosts().slice(0, 4);
	const products = getAllProducts().slice(0, 4);

	return (
		<footer className="border-t border-border/50 bg-background/50">
			<div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid gap-10 lg:grid-cols-12 lg:gap-x-8">
					{/* Brand */}
					<div className="lg:col-span-4">
						<Link
							href={ROUTES.home}
							className="inline-flex items-center gap-2 text-base font-semibold"
						>
							<span
								aria-hidden
								className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
							>
								<WrenchIcon className="h-5 w-5" />
							</span>
							{SITE_NAME}
						</Link>
						<p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
							{SITE_TAGLINE}
						</p>
						<div className="mt-4 flex items-center gap-2">
							<Tooltip label="Star on GitHub">
								<a
									href={REPO_URL}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Star on GitHub"
									className={iconLinkClass}
								>
									<GithubMark aria-hidden className="h-4 w-4" />
								</a>
							</Tooltip>
							<Tooltip label={`${CREATOR_NAME} on X`}>
								<a
									href={CREATOR_TWITTER_URL}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`${CREATOR_NAME} on X`}
									className={iconLinkClass}
								>
									<XLogo aria-hidden className="h-4 w-4" />
								</a>
							</Tooltip>
							<Tooltip label={`${CREATOR_NAME} on LinkedIn`}>
								<a
									href={CREATOR_LINKEDIN_URL}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`${CREATOR_NAME} on LinkedIn`}
									className={iconLinkClass}
								>
									<LinkedInLogo aria-hidden className="h-4 w-4" />
								</a>
							</Tooltip>
							<Tooltip label="Support these free tools" align="start">
								<a
									href={SUPPORT_URL}
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Support the project"
									className={iconLinkClass}
								>
									<HeartIcon aria-hidden className="h-4 w-4" />
								</a>
							</Tooltip>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-8">
						<FooterColumn heading="Tools">
							<li>
								<Link href={ROUTES.tools} className={linkClass}>
									All tools
								</Link>
							</li>
							{tools.map((tool) => (
								<li key={tool.slug}>
									<Link href={tool.href} className={linkClass}>
										{tool.name}
									</Link>
								</li>
							))}
						</FooterColumn>

						<FooterColumn heading="Blog">
							<li>
								<Link href={ROUTES.blog} className={linkClass}>
									All posts
								</Link>
							</li>
							{posts.map((post) => (
								<li key={post.slug}>
									<Link href={ROUTES.post(post.slug)} className={linkClass}>
										{post.title}
									</Link>
								</li>
							))}
						</FooterColumn>

						<FooterColumn heading="Shop">
							<li>
								<Link href={ROUTES.shop} className={linkClass}>
									All products
								</Link>
							</li>
							{products.map((product) => (
								<li key={product.slug}>
									<Link
										href={ROUTES.product(product.slug)}
										className={linkClass}
									>
										{product.title}
									</Link>
								</li>
							))}
						</FooterColumn>

						<FooterColumn heading="Explore">
							<li>
								<Link href={ROUTES.newsletter} className={linkClass}>
									Newsletter
								</Link>
							</li>
							<li>
								<Link href={ROUTES.categories} className={linkClass}>
									Categories
								</Link>
							</li>
							<li>
								<a
									href={SUPPORT_URL}
									target="_blank"
									rel="noopener noreferrer"
									className={linkClass}
								>
									Support
								</a>
							</li>
							<li>
								<a
									href={REPO_URL}
									target="_blank"
									rel="noopener noreferrer"
									className={linkClass}
								>
									Star on GitHub
								</a>
							</li>
							<li>
								<a
									href={`${REPO_URL}/issues`}
									target="_blank"
									rel="noopener noreferrer"
									className={linkClass}
								>
									Report an issue
								</a>
							</li>
						</FooterColumn>
					</div>
				</div>

				{/* Meta links — project + creator cross-links, kept out of the grid. */}
				<nav
					aria-label="More"
					className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/40 pt-6 text-sm"
				>
					{META_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							className={linkClass}
						>
							{link.label}
						</a>
					))}
				</nav>

				{/* Bottom bar */}
				<div className="mt-6 flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					<p>
						© {YEAR}{" "}
						<a
							href={CREATOR_URL}
							target="_blank"
							rel="noopener noreferrer"
							className={`${linkClass} underline underline-offset-2`}
						>
							{CREATOR_NAME}
						</a>{" "}
						· <span className="font-medium text-primary">{SITE_NAME}</span> is
						open source.
					</p>
					<nav aria-label="Legal">
						<ul className="flex items-center gap-x-4">
							{LEGAL_LINKS.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										className={linkClass}
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</footer>
	);
}
