/**
 * Hub identity, creator, and off-site links — imported everywhere (metadata,
 * JSON-LD, OG images, navbar, footer). Edit here to change the whole site.
 */

/** Canonical hub URL and display name. */
export const SITE_URL = "https://odd-jobs.timonwa.com";
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
// Two words, always plural: "Oddjob" is Goldfinger's henchman, a character read
// as an Asian stereotype. The plural phrase carries none of that.
export const SITE_NAME = "Odd Jobs";
/** Short name for home-screen icons, where the full name is truncated. */
export const SITE_SHORT_NAME = SITE_NAME;
/** PWA theme colour. Literal rather than a CSS token: the manifest is JSON, with no access to the stylesheet. */
export const SITE_THEME_COLOR = "#4472e3";
export const SITE_BACKGROUND_COLOR = "#ffffff";
// 42 chars, inside the ~60 search results show whole. "writing" covers the blog
// and newsletter, "templates" the shop.
export const SITE_TITLE = `${SITE_NAME} — free tools, writing & templates`;
// 145 chars, inside the ~155 search results cut at, so none of it clips. Avoids
// "jobs", which the name already spends.
export const SITE_DESCRIPTION =
	"Free tools for the repetitive parts of writing and code, writing on workflow, and templates worth keeping. For writers, developers, and creators.";
/** Short one-liner for tight spots like the footer, where SITE_DESCRIPTION runs long. */
export const SITE_TAGLINE =
	"Free tools, writing, and templates for writers, developers, and creators. No sign-up, open source.";

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

/** Third-party destination ids. Committed, not env-held — none is a secret, and
 * a value that differs per tier belongs in reviewed config rather than a
 * dashboard. Both currently point at the production property in every tier;
 * split them here if a separate staging destination is ever wanted. */
export const UMAMI_WEBSITE_ID = "4550710a-0c5e-462a-8012-5d3ee2f3769e";
/** Sender.net groups a new subscriber joins: "All customers" (account-wide) and "The Productivity Bug" (this site's list). */
export const SENDER_GROUP_IDS = ["b6VOlQ", "dw5jLr"];

/** Sender.net subscribers endpoint — the newsletter action's only outbound call. Versioned path, so a v3 migration is one edit here. */
export const SENDER_SUBSCRIBERS_URL = "https://api.sender.net/v2/subscribers";

/** Google AI Studio — where users create a free Gemini API key for BYOK. */
export const AI_STUDIO_URL = "https://aistudio.google.com";
export const AI_STUDIO_KEYS_URL = `${AI_STUDIO_URL}/api-keys`;
