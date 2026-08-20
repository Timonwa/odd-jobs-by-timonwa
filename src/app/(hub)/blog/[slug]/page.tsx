import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getNoIndexSeo } from "@/lib/config/page-seo";

import { PostPageContent } from "@/components/blog/post";
import { getPost, getPostSlugs } from "@/lib/server";
import { ROUTES } from "@/lib/config/routes";
import { siteConfig } from "@/lib/config/site";

// Known post slugs are prerendered; an unknown slug falls through to the
// notFound() below (`dynamicParams` can't be set alongside cacheComponents).
// That renders the 404 UI but still answers 200, so generateMetadata marks the
// response noindex — see NOINDEX_SEO.
export function generateStaticParams() {
	return getPostSlugs().map((slug) => ({ slug }));
}

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: PostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) return getNoIndexSeo("notFound");

	const path = ROUTES.post(slug);
	const url = `${siteConfig.url}${path}`;
	const title = post.title;

	return {
		title,
		description: post.description,
		keywords: post.keywords,
		alternates: { canonical: path },
		openGraph: {
			type: "article",
			url,
			siteName: siteConfig.name,
			title,
			description: post.description,
			locale: "en_US",
			publishedTime: post.publishedAt,
			modifiedTime: post.updatedAt ?? post.publishedAt,
			authors: [siteConfig.creator.url],
		},
		twitter: {
			card: "summary_large_image",
			site: siteConfig.twitter,
			creator: siteConfig.twitter,
			title,
			description: post.description,
		},
	};
}

export default async function PostPage({ params }: PostPageProps) {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) notFound();

	return <PostPageContent post={post} />;
}
