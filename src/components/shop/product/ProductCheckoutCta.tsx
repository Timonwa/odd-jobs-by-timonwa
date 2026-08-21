"use client";

import { ArrowUpRightIcon } from "lucide-react";
import { useId, useState } from "react";

import { buttonClasses, ToggleButton } from "@/components/ui";
import type { ProductMeta } from "@/lib/schemas";

export function ProductCheckoutCta({ product }: { product: ProductMeta }) {
	const [selected, setSelected] = useState(0);
	const groupId = useId();
	const variant = product.variants[selected] ?? product.variants[0];
	if (!variant) return null;

	const hasChoice = product.variants.length > 1;

	return (
		<div id="buy" className="mb-10 flex scroll-mt-24 flex-col gap-4">
			{hasChoice && (
				<fieldset className="flex flex-col gap-2">
					<legend id={groupId} className="text-sm font-medium mb-2">
						Choose a version
					</legend>
					<div className="flex flex-wrap gap-2">
						{product.variants.map((option, index) => (
							<ToggleButton
								key={option.name}
								active={index === selected}
								onClick={() => setSelected(index)}
								aria-pressed={index === selected}
							>
								{option.name}
								<span className="text-muted-foreground">{option.price}</span>
							</ToggleButton>
						))}
					</div>
				</fieldset>
			)}

			<div className="flex flex-wrap items-center gap-3">
				<a
					href={variant.checkoutUrl}
					data-umami-event="checkout-click"
					data-umami-event-variant={variant.name}
					target="_blank"
					rel="noopener noreferrer"
					className={buttonClasses({ size: "lg" })}
				>
					{product.checkoutLabel ?? "Get it now"}
					<ArrowUpRightIcon aria-hidden />
				</a>
				<span className="text-sm font-semibold text-foreground">
					{variant.price}
				</span>
			</div>
		</div>
	);
}
