import { BookOpenTextIcon, KeyRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import HubNavbar from "@/components/layout/HubNavbar";
import PageMain from "@/components/layout/PageMain";
import Newsletter from "@/components/_shared/content/Newsletter";
import { PageHero } from "@/components/ui";
import {
	CREATOR_NAME,
	CREATOR_TWITTER,
	CREATOR_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";
import { ROUTES } from "@/lib/config/routes";
import RelatedGrid from "@/components/_shared/content/RelatedGrid";
import { splitTitle } from "@/lib/content/split-title";
import { getAllPosts, getPost, getPostSlugs } from "@/lib/blog/loader";

// Known post slugs are prerendered; an unknown slug falls through to the
// notFound() below. (`dynamicParams` can't be set alongside cacheComponents.)
export function generateStaticParams() {
	return getPostSlugs().map((slug) => ({ slug }));
}

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: PostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) return {};

	const path = ROUTES.post(slug);
	const url = `${SITE_URL}${path}`;
	const title = post.title;

	return {
		title,
		description: post.description,
		keywords: post.keywords,
		alternates: { canonical: path },
		openGraph: {
			type: "article",
			url,
			siteName: SITE_NAME,
			title,
			description: post.description,
			locale: "en_US",
			publishedTime: post.publishedAt,
			modifiedTime: post.updatedAt ?? post.publishedAt,
			authors: [CREATOR_URL],
		},
		twitter: {
			card: "summary_large_image",
			site: CREATOR_TWITTER,
			creator: CREATOR_TWITTER,
			title,
			description: post.description,
		},
	};
}

export default async function PostPage({ params }: PostPageProps) {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) notFound();

	const { default: PostBody } = await import(`@/content/blog/${slug}.mdx`);
	const { lead, accent } = splitTitle(post);

	const related = getAllPosts()
		.filter((p) => p.slug !== slug)
		.slice(0, 3)
		.map((p) => ({
			href: ROUTES.post(p.slug),
			eyebrow: p.category,
			title: p.title,
			metaRight: `${p.readingMinutes} min read`,
		}));

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.description,
		datePublished: post.publishedAt,
		dateModified: post.updatedAt ?? post.publishedAt,
		inLanguage: "en",
		image: `${SITE_URL}${ROUTES.post(slug)}/opengraph-image`,
		mainEntityOfPage: `${SITE_URL}${ROUTES.post(slug)}`,
		author: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		publisher: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		keywords: post.keywords.join(", "),
	};

	return (
		<>
			<HubNavbar />
			<PageMain>
				<div className="mx-auto max-w-3xl">
					<PageHero
						className="mb-10"
						eyebrow={{ icon: KeyRoundIcon, label: post.eyebrow }}
						title={
							lead ? (
								<>
									{lead}
									<span className="hero-gradient-text">{accent}</span>
								</>
							) : (
								post.title
							)
						}
						subtitle={post.description}
					/>

					<article>
						<PostBody />
					</article>

					<RelatedGrid heading="More posts" items={related} />

					<Newsletter className="mt-16" />

					<footer className="mt-16 border-t border-border/60 pt-8">
						<Link
							href={ROUTES.blog}
							className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
						>
							<BookOpenTextIcon aria-hidden className="h-4 w-4" />
							Browse all posts
						</Link>
					</footer>
				</div>

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
