import { ArrowRightIcon } from "lucide-react";

import { DraftBadge } from "@/components/_shared/content";
import { LinkCard } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import type { ProductMeta } from "@/lib/schemas";

export function ProductGrid({ products }: { products: ProductMeta[] }) {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{products.map((product) => (
				<li key={product.slug}>
					<LinkCard href={ROUTES.product(product.slug)}>
						<span className="flex items-center justify-between gap-2">
							<span className="flex items-center gap-2">
								<span className="text-xs font-medium uppercase tracking-wide text-primary">
									{product.category}
								</span>
								<DraftBadge isDraft={product.isDraft} />
							</span>
							{product.variants[0] && (
								<span className="text-xs font-semibold text-foreground">
									{product.variants[0].price}
								</span>
							)}
						</span>
						<h2 className="mt-2 text-lg font-semibold tracking-tight">
							{product.title}
						</h2>
						<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
							{product.description}
						</p>
						<span className="mt-4 flex items-center gap-1.5 text-sm text-primary">
							View details
							<ArrowRightIcon
								aria-hidden
								className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5"
							/>
						</span>
					</LinkCard>
				</li>
			))}
		</ul>
	);
}
