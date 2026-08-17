/**
 * Hub identity, creator, and off-site links — imported everywhere (metadata,
 * JSON-LD, OG images, navbar, footer). Edit here to change the whole site.
 */

/** Canonical hub URL and display name. */
export const SITE_URL = "https://tools.timonwa.com";
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
export const SITE_NAME = "The Productivity Bug";
export const SITE_TITLE = `${SITE_NAME} — Free, focused tools for writers, developers, and creators`;
export const SITE_DESCRIPTION =
	"Free, focused web tools that handle the busywork of writing and code — turn an article into social posts, convert SVG to JSX, size SEO titles, generate slugs, and more. No sign-up, open source.";
/** Short one-liner for tight spots like the footer, where SITE_DESCRIPTION runs long. */
export const SITE_TAGLINE =
	"Free, focused productivity tools for writers, developers, and creators. No sign-up, open source.";

/** Creator / author — referenced from metadata, JSON-LD, and the footer. */
export const CREATOR_NAME = "Timonwa Akintokun";
/** Link hub (linktree-style) for the creator. */
export const CREATOR_URL = "https://links.timonwa.com";
/** Twitter/X handle (used in Twitter card metadata). */
export const CREATOR_TWITTER = "@timonwa_";

/** Creator's main personal site — used for JSON-LD `sameAs` and the footer. */
export const CREATOR_SITE_URL = "https://www.timonwa.com";
export const CREATOR_TWITTER_URL = `https://x.com/${CREATOR_TWITTER.slice(1)}`;
export const CREATOR_LINKEDIN_URL = "https://linkedin.com/in/timonwa";
/** Creator's shop — linked from the footer. */
export const CREATOR_SHOP_URL = `${CREATOR_SITE_URL}/shop`;
/** Creator's dev blog (Timonwa's Notes) — a separate property from this site's blog. */
export const CREATOR_BLOG_URL = "https://tech.timonwa.com/blog";
export const CREATOR_SAME_AS = [
	CREATOR_TWITTER_URL,
	CREATOR_LINKEDIN_URL,
	CREATOR_SITE_URL,
];

/** GitHub repo — Navbar star button, Footer repo links, tool JSON-LD. */
export const REPO_URL = "https://github.com/Timonwa/tools-by-timonwa";

/** Support link (Navbar). */
export const SUPPORT_URL = `${CREATOR_SITE_URL}/support`;

/** Legal pages, hosted on the main site (Footer). */
export const TERMS_URL = `${CREATOR_SITE_URL}/terms`;
export const PRIVACY_URL = `${CREATOR_SITE_URL}/privacy`;

/** Base for product canonicals — each shop product declares the equivalent
 * www.timonwa.com/shop/<slug> as its canonical (the authoritative listing). */
export const SHOP_CANONICAL_BASE = `${CREATOR_SITE_URL}/shop`;

/** Google AI Studio — where users create a free Gemini API key for BYOK. */
export const AI_STUDIO_URL = "https://aistudio.google.com";
export const AI_STUDIO_KEYS_URL = `${AI_STUDIO_URL}/api-keys`;
