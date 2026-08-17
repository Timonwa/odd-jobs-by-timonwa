import { ShoppingBagIcon } from "lucide-react";

import { splitTitle } from "@/lib/content/split-title";
import type { ProductMeta } from "@/lib/shop/products";

export function ProductHeader({ product }: { product: ProductMeta }) {
	const { lead, accent } = splitTitle(product);
	return (
		<header className="mb-8">
			<span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
				<ShoppingBagIcon aria-hidden className="h-3.5 w-3.5" />
				{product.eyebrow}
			</span>
			<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
				{lead ? (
					<>
						{lead}
						<span className="hero-gradient-text">{accent}</span>
					</>
				) : (
					product.title
				)}
			</h1>
			<p className="mt-3 leading-relaxed text-muted-foreground">
				{product.description}
			</p>
		</header>
	);
}
