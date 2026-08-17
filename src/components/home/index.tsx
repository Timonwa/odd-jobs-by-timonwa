import { HubNavbar } from "@/components/_shared/layout";
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
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl">
				<HomeHero />
				<ToolsPreview />
				<WhatItIs />
				<BrowseByCategory />
				<HowItWorks />
				<WhyUseIt />
				<LatestPosts />
				<ShopPreview />
				<Newsletter className="mt-20 sm:mt-24" />
			</main>
		</>
	);
}
