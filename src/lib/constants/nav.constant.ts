// The links the navbar menu and footer both render — one source, so the two
// surfaces can't drift.

import { ROUTES } from "@/lib/config/routes";
import {
	CREATOR_BLOG_URL,
	CREATOR_SITE_URL,
	CREATOR_URL,
	PRIVACY_URL,
	TERMS_URL,
} from "@/lib/config/site";

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

/** Creator cross-links — a compact row in the footer's bottom area. */
export const FOOTER_META_LINKS = [
	{ href: CREATOR_SITE_URL, label: "Main site" },
	{ href: CREATOR_BLOG_URL, label: "Dev blog" },
	{ href: CREATOR_URL, label: "All my links" },
] as const;

export const FOOTER_LEGAL_LINKS = [
	{ href: TERMS_URL, label: "Terms" },
	{ href: PRIVACY_URL, label: "Privacy" },
] as const;
