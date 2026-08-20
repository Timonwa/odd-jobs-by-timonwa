import { ShoppingBagIcon } from "lucide-react";

import { PageHero } from "@/components/ui";
import { getIndexedSeo, splitHeading } from "@/lib/config/page-seo";

const SEO = getIndexedSeo("shop");
const HEADING = splitHeading(SEO.heading);

export function ShopHero() {
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: ShoppingBagIcon, label: SEO.eyebrow }}
			title={
				<>
					{HEADING.lead}
					<span className="hero-gradient-text">{HEADING.accent}</span>
					{HEADING.trail}
				</>
			}
			subtitle={SEO.subtitle}
		/>
	);
}
