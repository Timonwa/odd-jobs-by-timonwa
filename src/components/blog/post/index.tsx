import {
	JsonLdScript,
	Newsletter,
	RelatedGrid,
} from "@/components/_shared/content";
import { HubNavbar } from "@/components/_shared/layout";
import { PageMain } from "@/components/ui";
import type { PostMeta } from "@/lib/schemas";
import { getAllPosts } from "@/lib/server";
import { ROUTES } from "@/lib/config/routes";
import { CREATOR_NAME, CREATOR_URL, SITE_URL } from "@/lib/config/site";

import { PostHero } from "./PostHero";
import { PostPageFooter } from "./PostPageFooter";

export async function PostPageContent({ post }: { post: PostMeta }) {
	const { default: PostBody } = await import(`@/content/blog/${post.slug}.mdx`);

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
		image: `${SITE_URL}${ROUTES.post(post.slug)}/opengraph-image`,
		mainEntityOfPage: `${SITE_URL}${ROUTES.post(post.slug)}`,
		author: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		publisher: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		keywords: post.keywords.join(", "),
	};

	return (
		<>
			<HubNavbar />
			<PageMain>
				<div className="mx-auto max-w-3xl">
					<PostHero post={post} />
					<article>
						<PostBody />
					</article>
					<RelatedGrid heading="More posts" items={related} />
					<Newsletter className="mt-16" />
					<PostPageFooter />
				</div>
				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
