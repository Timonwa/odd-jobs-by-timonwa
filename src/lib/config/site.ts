const SITE_URL = "https://odd-jobs.timonwa.com";
const CREATOR_NAME = "Timonwa Akintokun";
const CREATOR_SITE_URL = "https://www.timonwa.com";
const CREATOR_TWITTER = "@timonwa_";

export const siteConfig = {
	name: "Odd Jobs",
	shortName: "Odd Jobs",
	url: SITE_URL,
	domain: SITE_URL.replace(/^https?:\/\//, ""),
	title: "Odd Jobs — free tools, writing & templates",
	description:
		"Free tools for the repetitive parts of writing and code, guides on working better, and templates worth keeping. For writers, developers, and creators.",
	tagline:
		"Free tools, writing, and templates for writers, developers, and creators. No sign-up, open source.",
	themeColor: "#4472e3",
	backgroundColor: "#ffffff",
	twitter: CREATOR_TWITTER,
	defaultSiteType: "website",
	umamiWebsiteId: "4550710a-0c5e-462a-8012-5d3ee2f3769e",
	creator: {
		name: CREATOR_NAME,
		url: "https://links.timonwa.com",
		siteUrl: CREATOR_SITE_URL,
		twitterUrl: `https://x.com/${CREATOR_TWITTER.slice(1)}`,
		linkedinUrl: "https://linkedin.com/in/timonwa",
		buildingUrl: `${CREATOR_SITE_URL}/building`,
		sameAs: [
			`https://x.com/${CREATOR_TWITTER.slice(1)}`,
			"https://linkedin.com/in/timonwa",
			CREATOR_SITE_URL,
		],
	},
} as const;
