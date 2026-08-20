// The links the navbar menu and footer both render — one source, so the two
// surfaces can't drift.

import { ROUTES } from "@/lib/config/routes";
import { siteConfig } from "@/lib/config/site";
import { EXTERNAL_ROUTES } from "@/lib/config/routes";

/** Primary nav links, in menu order. */
export const NAV_LINKS = [
	{ label: "Home", href: ROUTES.home },
	{ label: "Tools", href: ROUTES.tools },
	{ label: "Categories", href: ROUTES.categories },
	{ label: "Blog", href: ROUTES.blog },
	{ label: "Shop", href: ROUTES.shop },
	{ label: "Newsletter", href: ROUTES.newsletter },
] as const;

export type NavLinkLabel = (typeof NAV_LINKS)[number]["label"];

const PILLAR_LABELS: readonly NavLinkLabel[] = [
	"Tools",
	"Blog",
	"Shop",
	"Newsletter",
];

/** The site's four sections, for the desktop navbar. Home is the brand mark and Categories belongs to the tools directory, so neither is one. */
export const NAV_PILLARS = NAV_LINKS.filter((navLink) =>
	PILLAR_LABELS.includes(navLink.label),
);

/** Creator cross-links — a compact row in the footer's bottom area. */
export const FOOTER_META_LINKS = [
	{ href: siteConfig.creator.siteUrl, label: "Main site" },
	{ href: siteConfig.creator.buildingUrl, label: "Building" },
	{ href: siteConfig.creator.url, label: "All my links" },
] as const;

export const FOOTER_LEGAL_LINKS = [
	{ href: EXTERNAL_ROUTES.terms, label: "Terms" },
	{ href: EXTERNAL_ROUTES.privacy, label: "Privacy" },
] as const;
