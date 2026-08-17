import { ArrowUpRightIcon } from "lucide-react";

import { buttonClasses } from "@/components/ui";
import type { ProductMeta } from "@/lib/shop/products";

export function ProductCheckoutCta({ product }: { product: ProductMeta }) {
	return (
		<div
			id="buy"
			className="mb-10 flex scroll-mt-24 flex-wrap items-center gap-3"
		>
			<a
				href={product.checkoutUrl}
				target="_blank"
				rel="noopener noreferrer"
				className={buttonClasses({ size: "lg" })}
			>
				{product.checkoutLabel ?? "Get it now"}
				<ArrowUpRightIcon aria-hidden />
			</a>
			{product.price && (
				<span className="text-sm font-semibold text-foreground">
					{product.price}
				</span>
			)}
		</div>
	);
}
