import { ShoppingBagIcon } from "lucide-react";

import { PageHero } from "@/components/ui";
import { SHOP_PAGE_COPY } from "@/lib/data";

export function ShopHero() {
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: ShoppingBagIcon, label: "Shop" }}
			title={
				<>
					Templates <span className="hero-gradient-text">worth keeping</span>
				</>
			}
			subtitle={SHOP_PAGE_COPY.description}
		/>
	);
}
