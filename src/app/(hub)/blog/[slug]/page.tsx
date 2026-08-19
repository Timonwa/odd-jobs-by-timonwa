import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NOT_FOUND_METADATA } from "@/lib/constants";

import { PostPageContent } from "@/components/blog/post";
import { getPost, getPostSlugs } from "@/lib/server";
import { ROUTES } from "@/lib/config/routes";
import {
	CREATOR_TWITTER,
	CREATOR_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";

// Known post slugs are prerendered; an unknown slug falls through to the
// notFound() below (`dynamicParams` can't be set alongside cacheComponents).
// That renders the 404 UI but still answers 200, so generateMetadata marks the
// response noindex — see NOT_FOUND_METADATA.
export function generateStaticParams() {
	return getPostSlugs().map((slug) => ({ slug }));
}

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: PostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) return NOT_FOUND_METADATA;

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

	return <PostPageContent post={post} />;
}
