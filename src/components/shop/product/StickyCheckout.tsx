"use client";

import { ArrowUpIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { buttonClasses } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Fades in a fixed button once the `#buy` block scrolls off the top, jumping
 * back to it so the version is chosen there rather than bypassed here. */
export function StickyCheckout({ label = "Get it now" }: { label?: string }) {
	const [show, setShow] = useState(false);

	useEffect(() => {
		const target = document.getElementById("buy");
		if (!target) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry) return;
			setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
		});
		observer.observe(target);
		return () => observer.disconnect();
	}, []);

	// Outer wrapper mirrors PageMain's container (max-w-6xl + same padding) so the
	// button lines up with the page content's right edge, not the viewport edge.
	return (
		<div
			aria-hidden={!show}
			className={cn(
				"pointer-events-none fixed inset-x-0 bottom-24 z-40 transition-[opacity,transform] duration-300",
				show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
			)}
		>
			<div className="container mx-auto flex max-w-6xl justify-end px-4 sm:px-6 lg:px-8">
				<a
					href="#buy"
					tabIndex={show ? 0 : -1}
					className={cn(
						buttonClasses({ size: "lg" }),
						"shadow-lg",
						show ? "pointer-events-auto" : "pointer-events-none",
					)}
				>
					{label}
					<ArrowUpIcon aria-hidden />
				</a>
			</div>
		</div>
	);
}
