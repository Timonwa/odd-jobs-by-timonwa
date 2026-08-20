import { PageMain } from "@/components/ui";
import { Newsletter } from "@/components/_shared/content";
import { BrowseByCategory } from "./BrowseByCategory";
import { HomeHero } from "./HomeHero";
import { HowItWorks } from "./HowItWorks";
import { LatestPosts } from "./LatestPosts";
import { ShopPreview } from "./ShopPreview";
import { ToolsPreview } from "./ToolsPreview";
import { WhatItIs } from "./WhatItIs";
import { WhyUseIt } from "./WhyUseIt";
import { JsonLdScript } from "@/components/_shared/content";
import { buildSiteGraphJsonLd } from "@/lib/utils";

export function HubHomePageContent() {
	return (
		<>
			<JsonLdScript data={buildSiteGraphJsonLd()} />
			<PageMain>
				<HomeHero />
				<ToolsPreview />
				<BrowseByCategory />
				<HowItWorks />
				<WhyUseIt />
				<WhatItIs />
				<LatestPosts />
				<ShopPreview />
				<Newsletter className="mt-20 sm:mt-24" />
			</PageMain>
		</>
	);
}
