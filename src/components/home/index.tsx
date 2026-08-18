import { HubNavbar } from "@/components/_shared/layout";
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

export function HubHomePageContent() {
	return (
		<>
			<HubNavbar />
			<PageMain>
				<HomeHero />
				<ToolsPreview />
				<WhatItIs />
				<BrowseByCategory />
				<HowItWorks />
				<WhyUseIt />
				<LatestPosts />
				<ShopPreview />
				<Newsletter className="mt-20 sm:mt-24" />
			</PageMain>
		</>
	);
}
