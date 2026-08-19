import type { Metadata } from "next";

/**
 * Metadata for a URL whose content doesn't exist.
 *
 * `notFound()` renders the 404 UI but cannot set a 404 status here: Next returns
 * 200 for streamed responses, and `cacheComponents` streams a static shell on
 * every dynamic route, so the status is already sent before the slug is checked.
 * Returning `noindex` is what keeps the resulting soft 404 out of search results
 * — without it, Google can index every misspelled URL as a real page.
 */
export const NOT_FOUND_METADATA: Metadata = {
	robots: { index: false, follow: false },
};
