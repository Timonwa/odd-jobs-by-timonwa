import { LinkCard } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import type { ProductMetaType } from "@/lib/schemas";

/** Sidebar list of sibling products shown alongside a product's detail. */
export function MoreProducts({ products }: { products: ProductMetaType[] }) {
	if (products.length === 0) return null;

	return (
		<aside
			aria-labelledby="more-products-heading"
			className="flex flex-col gap-3"
		>
			<h2
				id="more-products-heading"
				className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
			>
				More in the shop
			</h2>
			<ul className="flex flex-col gap-3">
				{products.map((product) => (
					<li key={product.slug}>
						<LinkCard href={ROUTES.product(product.slug)}>
							<span className="flex items-center justify-between gap-2">
								<span className="text-xs font-medium uppercase tracking-wide text-primary">
									{product.category}
								</span>
								{product.price && (
									<span className="text-xs font-semibold text-foreground">
										{product.price}
									</span>
								)}
							</span>
							<span className="mt-2 block text-sm font-semibold leading-snug">
								{product.title}
							</span>
						</LinkCard>
					</li>
				))}
			</ul>
		</aside>
	);
}
