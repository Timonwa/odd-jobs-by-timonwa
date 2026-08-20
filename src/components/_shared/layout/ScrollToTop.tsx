"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Glides to the top on route change.
 *
 * The router's own restoration jumps, and `scroll-behavior: smooth` can't animate
 * it because it fires before the new route paints. This runs after, so the
 * animation has something to scroll. Skips the first render (a fresh load is
 * already at the top, and a deep link must keep its position) and any URL
 * carrying a hash, which belongs to the anchor.
 */
export function ScrollToTop() {
	const pathname = usePathname();
	const isFirstRender = useRef(true);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		if (window.location.hash) return;

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		window.scrollTo({
			top: 0,
			behavior: prefersReducedMotion ? "auto" : "smooth",
		});
	}, [pathname]);

	return null;
}
