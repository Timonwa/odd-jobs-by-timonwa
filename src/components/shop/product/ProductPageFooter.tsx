import { ShoppingBagIcon } from "lucide-react";
import Link from "next/link";

import { SupportNote } from "@/components/_shared/content";
import { ROUTES } from "@/lib/config/routes";

export function ProductPageFooter() {
	return (
		<footer className="mt-16 flex flex-col gap-3 border-t border-border/60 pt-8">
			<Link
				href={ROUTES.shop}
				className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
			>
				<ShoppingBagIcon aria-hidden className="h-4 w-4" />
				Browse all products
			</Link>
			<SupportNote lead="The tools and templates here are free, and the code is open source." />
		</footer>
	);
}
