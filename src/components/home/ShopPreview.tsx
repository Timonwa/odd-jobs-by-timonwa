import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { DraftBadge } from "@/components/_shared/content";
import { buttonClasses, LinkCard } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { getAllProducts } from "@/lib/server";

export function ShopPreview() {
	const products = getAllProducts().slice(0, 3);
	if (products.length === 0) return null;

	return (
		<section aria-labelledby="shop-preview-heading" className="section">
			<div className="flex items-center justify-between gap-4">
				<h2
					id="shop-preview-heading"
					className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
				>
					From the shop
				</h2>
				<Link
					href={ROUTES.shop}
					className={buttonClasses({ variant: "outline", size: "sm" })}
				>
					Visit the shop
					<ArrowRightIcon aria-hidden className="h-4 w-4" />
				</Link>
			</div>

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
								{product.price && (
									<span className="text-xs font-semibold text-foreground">
										{product.price}
									</span>
								)}
							</span>
							<h3 className="mt-2 text-lg font-semibold tracking-tight">
								{product.title}
							</h3>
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
		</section>
	);
}
