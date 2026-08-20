import type { Metadata } from "next";

import { siteConfig } from "@/lib/config/site";

import { ROUTES } from "./routes";

export type PageSeo = {
	title: string;
	description: string;
	heading: { lead: string; accent: string; trail?: string };
	subtitle: string;
	eyebrow: string;
	og: {
		eyebrow: string;
		titleLead: string;
		titleAccent: string;
		subtitle: string;
		pills: string[];
	};
};

export const INDEXED_SEO = {
	home: {
		title: `${siteConfig.name} — free tools, writing & templates`,
		description:
			"Free tools for the repetitive parts of writing and code, writing on workflow, and templates worth keeping. For writers, developers, and creators.",
		heading: { lead: "The", accent: "odd jobs", trail: "in writing and code" },
		subtitle:
			"Free tools that each do one of them, plus writing on workflow and templates worth keeping.",
		eyebrow: "Free · no sign-up · open source",
		og: {
			eyebrow: `${siteConfig.name} · Free · Open source`,
			titleLead: "The odd jobs in",
			titleAccent: "writing and code",
			subtitle:
				"Free tools that each do one of them, plus writing on workflow and templates worth keeping.",
			pills: ["Free", "No sign-up", "Open source"],
		},
	},
	tools: {
		title: "All tools — the full directory",
		description:
			"Browse every tool in the hub and filter by category: AI writing helpers, SEO, developer, and text utilities for writers, developers, and creators.",
		heading: { lead: "Every", accent: "odd job", trail: ", one place" },
		subtitle:
			"Each tool does one thing. Browse them all, or filter by category to find the one you came for. New ones land here as they ship.",
		eyebrow: "All tools",
		og: {
			eyebrow: `Tools · ${siteConfig.name}`,
			titleLead: "Every tool,",
			titleAccent: "one directory",
			subtitle:
				"AI writing helpers, SEO, developer, and text utilities — free, no sign-up.",
			pills: ["AI writing", "SEO", "Developer", "Text"],
		},
	},
	categories: {
		title: "Tool categories — browse by what you need",
		description:
			"Browse the hub by category: AI writing helpers, SEO, developer utilities, text, and media tools for writers, developers, and creators.",
		heading: { lead: "Browse tools by", accent: "category" },
		subtitle:
			"Every tool belongs to one or more categories — pick a lane to see what's there, and what's on the way.",
		eyebrow: "Categories",
		og: {
			eyebrow: `Categories · ${siteConfig.name}`,
			titleLead: "Browse by",
			titleAccent: "what you need",
			subtitle:
				"AI writing helpers, SEO, developer utilities, text, and media tools.",
			pills: ["AI writing", "SEO", "Developer", "Text"],
		},
	},
	blog: {
		title: "Blog — writing on workflow and the tools behind it",
		description:
			"How the work actually gets done: the workflows, the shortcuts, and the tools that came out of them.",
		heading: { lead: "How the work", accent: "actually gets done" },
		subtitle:
			"The workflows, the shortcuts, and the tools that came out of them.",
		eyebrow: "Blog",
		og: {
			eyebrow: `Blog · ${siteConfig.name}`,
			titleLead: "Getting things done,",
			titleAccent: "made simpler",
			subtitle:
				"How the work actually gets done: the workflows, the shortcuts, and the tools that came out of them.",
			pills: ["Productivity", "Workflow", "Tips"],
		},
	},
	newsletter: {
		title: "Newsletter — new tools and workflow notes by email",
		description:
			"The Odd Jobs newsletter — new tools and new posts in your inbox. Read past issues or subscribe below.",
		heading: { lead: "New tools and workflow notes, in your", accent: "inbox" },
		subtitle:
			"New tools and new posts in your inbox. Read past issues or subscribe.",
		eyebrow: "Newsletter",
		og: {
			eyebrow: `Newsletter · ${siteConfig.name}`,
			titleLead: "Productivity, in your",
			titleAccent: "inbox",
			subtitle:
				"The Odd Jobs newsletter — new tools and new posts in your inbox. Read past issues or subscribe below.",
			pills: ["Tools", "Posts", "Notes"],
		},
	},
	shop: {
		title: "Shop — templates and starters worth keeping",
		description:
			"Notion templates and starter kits I built for my own work, tidied up so you can use them too.",
		heading: { lead: "Templates", accent: "worth keeping" },
		subtitle:
			"Notion templates and starter kits I built for my own work, tidied up so you can use them too.",
		eyebrow: "Shop",
		og: {
			eyebrow: `Shop · ${siteConfig.name}`,
			titleLead: "Products that get",
			titleAccent: "things done",
			subtitle:
				"Notion templates and starter kits I built for my own work, tidied up so you can use them too.",
			pills: ["Notion", "Templates", "Digital"],
		},
	},
} as const satisfies Record<string, PageSeo>;

export type IndexedSeoKey = keyof typeof INDEXED_SEO;

export const getIndexedSeo = (key: IndexedSeoKey): PageSeo => INDEXED_SEO[key];

// A streamed response can't carry a 404 status, so noindex is what keeps soft 404s unindexed.
export const NOINDEX_SEO = {
	notFound: { robots: { index: false, follow: false } },
} as const satisfies Record<string, Metadata>;

export type NoIndexSeoKey = keyof typeof NOINDEX_SEO;

export const getNoIndexSeo = (key: NoIndexSeoKey): Metadata => NOINDEX_SEO[key];

type BuildPageMetadataOptions = {
	canonical?: string;
};

export function buildPageMetadata(
	seo: PageSeo,
	path: string,
	{ canonical }: BuildPageMetadataOptions = {},
): Metadata {
	return {
		title: seo.title,
		description: seo.description,
		alternates: { canonical: canonical ?? path },
		openGraph: {
			type: siteConfig.defaultSiteType,
			url: `${siteConfig.url}${path}`,
			siteName: siteConfig.name,
			title: seo.title,
			description: seo.description,
			locale: "en_US",
		},
		twitter: {
			card: "summary_large_image",
			site: siteConfig.twitter,
			creator: siteConfig.twitter,
			title: seo.title,
			description: seo.description,
		},
	};
}

// A `trail` starting with punctuation must butt against the accent, not follow a space.
export function splitHeading(heading: PageSeo["heading"]) {
	const trail = heading.trail;
	return {
		lead: `${heading.lead} `,
		accent: heading.accent,
		trail: trail ? (/^[,.:;!?]/.test(trail) ? trail : ` ${trail}`) : "",
	};
}

export function buildOgImageConfig(seo: PageSeo) {
	return {
		eyebrow: seo.og.eyebrow,
		titleLead: seo.og.titleLead,
		titleAccent: seo.og.titleAccent,
		subtitle: seo.og.subtitle,
		pills: seo.og.pills,
	};
}

export const INDEXED_SEO_PATHS: Record<IndexedSeoKey, string> = {
	home: ROUTES.home,
	tools: ROUTES.tools,
	categories: ROUTES.categories,
	blog: ROUTES.blog,
	newsletter: ROUTES.newsletter,
	shop: ROUTES.shop,
};
