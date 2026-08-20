import {
	ContentBreadcrumbs,
	JsonLdScript,
	Newsletter,
	RelatedAside,
} from "@/components/_shared/content";
import { PageMain } from "@/components/ui";
import type { PostMeta } from "@/lib/schemas";
import { getAllPosts } from "@/lib/server";
import { ROUTES } from "@/lib/config/routes";
import { ogImageUrl } from "@/lib/utils";
import { ShareBar } from "@/components/_shared/tool";
import { siteConfig } from "@/lib/config/site";

import { PostHero } from "./PostHero";
import { PostPageFooter } from "./PostPageFooter";

export async function PostPageContent({ post }: { post: PostMeta }) {
	const { default: PostBody } = await import(
		`@/content/blog/${post.contentPath}.mdx`
	);

	const related = getAllPosts()
		.filter((p) => p.slug !== post.slug)
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
		image: ogImageUrl(ROUTES.post(post.slug)),
		mainEntityOfPage: `${siteConfig.url}${ROUTES.post(post.slug)}`,
		author: {
			"@type": "Person",
			name: siteConfig.creator.name,
			url: siteConfig.creator.url,
		},
		publisher: {
			"@type": "Person",
			name: siteConfig.creator.name,
			url: siteConfig.creator.url,
		},
		keywords: post.keywords.join(", "),
	};

	return (
		<>
			<PageMain>
				<ContentBreadcrumbs
					section="blog"
					title={post.title}
					action={
						<ShareBar
							url={`${siteConfig.url}${ROUTES.post(post.slug)}`}
							title={post.title}
							shareText={post.description}
							subject="post"
						/>
					}
				/>
				<div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
					<div className="flex flex-col lg:col-span-2">
						<PostHero post={post} />
						<article>
							<PostBody />
						</article>
						<PostPageFooter />
					</div>

					{related.length > 0 && (
						<div className="lg:col-span-1">
							<div className="lg:sticky lg:top-24">
								<RelatedAside
									id="more-posts"
									heading="More posts"
									items={related}
								/>
							</div>
						</div>
					)}
				</div>

				<Newsletter className="mt-16" />

				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
