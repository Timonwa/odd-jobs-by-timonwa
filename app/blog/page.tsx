import { ArrowRightIcon, BookOpenTextIcon, ClockIcon } from "lucide-react";
import type { Metadata } from "next";

import HubNavbar from "@/components/layout/HubNavbar";
import PageMain from "@/components/layout/PageMain";
import Newsletter from "@/components/_shared/content/Newsletter";
import { LinkCard, PageHero } from "@/components/ui";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { ROUTES } from "@/lib/config/routes";
import { getAllPosts } from "@/lib/blog/loader";

const PATH = ROUTES.blog;
const TITLE = "Blog";
const DESCRIPTION =
	"Practical tips, systems, and ideas on productivity and workflow — to help you get more done.";

export const metadata: Metadata = {
	title: TITLE,
	description: DESCRIPTION,
	alternates: { canonical: PATH },
	openGraph: {
		type: "website",
		url: `${SITE_URL}${PATH}`,
		siteName: SITE_NAME,
		title: TITLE,
		description: DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: TITLE,
		description: DESCRIPTION,
	},
};

export default function BlogIndexPage() {
	const posts = getAllPosts();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `Blog — ${SITE_NAME}`,
		itemListElement: posts.map((p, i) => ({
			"@type": "ListItem",
			position: i + 1,
			url: `${SITE_URL}${ROUTES.post(p.slug)}`,
			name: p.title,
		})),
	};

	return (
		<>
			<HubNavbar />
			<PageMain>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: BookOpenTextIcon, label: "Blog" }}
					title={
						<>
							Getting things done,{" "}
							<span className="hero-gradient-text">made simpler</span>
						</>
					}
					subtitle={DESCRIPTION}
				/>

				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{posts.map((post) => (
						<li key={post.slug}>
							<LinkCard href={ROUTES.post(post.slug)}>
								<span className="text-xs font-medium uppercase tracking-wide text-primary">
									{post.category}
								</span>
								<h2 className="mt-2 text-lg font-semibold tracking-tight">
									{post.title}
								</h2>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
									{post.description}
								</p>
								<span className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
									<ClockIcon aria-hidden className="h-3.5 w-3.5" />
									{post.readingMinutes} min read
									<ArrowRightIcon
										aria-hidden
										className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5"
									/>
								</span>
							</LinkCard>
						</li>
					))}
				</ul>

				<Newsletter className="mt-16" />

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</PageMain>
		</>
	);
}
