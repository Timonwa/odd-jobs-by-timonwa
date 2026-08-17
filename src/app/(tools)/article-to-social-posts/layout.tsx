import type { Metadata } from "next";

import {
	CREATOR_NAME,
	CREATOR_SAME_AS,
	CREATOR_TWITTER,
	CREATOR_URL,
	REPO_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";

const TOOL_PATH = "/article-to-social-posts";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Article to Social Posts — a post for each network";
const TOOL_DESCRIPTION =
	"Turn an article URL or draft into a post tuned for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack — with tone, hashtag, and thread controls. Free.";

export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Article to Social Posts",
	alternates: { canonical: TOOL_PATH },
	openGraph: {
		type: "website",
		url: TOOL_URL,
		siteName: SITE_NAME,
		title: TOOL_TITLE,
		description: TOOL_DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		site: CREATOR_TWITTER,
		creator: CREATOR_TWITTER,
		title: TOOL_TITLE,
		description: TOOL_DESCRIPTION,
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	name: "Article to Social Posts",
	alternateName: "Article to Social",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "BusinessApplication",
	applicationSubCategory: "Social media content tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"article to social",
		"social media post generator",
		"article to tweet",
		"article to LinkedIn",
		"AI social media writer",
		"multi-platform social posts",
		"X thread generator",
		"Bluesky post generator",
		"Threads post generator",
		"Mastodon post generator",
		"Substack Notes generator",
		"open source writer tool",
		"bring your own key",
		"Gemini API",
	].join(", "),
	featureList: [
		"Paste an article URL or its text",
		"One post tailored to each network: X, LinkedIn, Threads, Bluesky, Mastodon, and Substack",
		"Free-tier character limits per platform (X 280, Bluesky 300, Threads and Mastodon 500)",
		"Post length control for the longer-form networks (LinkedIn and Substack)",
		"Tone control: auto, professional, casual, educational, punchy",
		"Voice, emoji density, and hashtag density preferences",
		"Multi-post threads for X, Bluesky, Threads, and Mastodon",
		"Custom always-include and never-use hashtag rules",
		"Save reusable presets of your tone, platforms, and writing style",
		"Regenerate a single platform's post without re-fetching",
		"Edit posts inline with live character counters",
		"Local history across sessions",
		"Bring Your Own Key (Google AI Studio / Gemini) for unlimited use",
		"Copy-only by design — no OAuth, no publishing credentials stored",
		"Open source",
	],
	creator: {
		"@type": "Person",
		name: CREATOR_NAME,
		url: CREATOR_URL,
		sameAs: CREATOR_SAME_AS,
	},
	sameAs: [REPO_URL],
};

export default function ArticleToSocialPostsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-article-to-social-posts contents">
			<script
				type="application/ld+json"
				// JSON-LD structured data per Next.js docs
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
				}}
			/>
			{children}
		</div>
	);
}
