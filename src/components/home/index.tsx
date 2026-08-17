import HubNavbar from "@/components/layout/HubNavbar";
import Newsletter from "@/components/_shared/content/Newsletter";
import BrowseByCategory from "./BrowseByCategory";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import LatestPosts from "./LatestPosts";
import ShopPreview from "./ShopPreview";
import ToolsPreview from "./ToolsPreview";
import WhatItIs from "./WhatItIs";
import WhyUseIt from "./WhyUseIt";

export default function HubHomePageContent() {
	return (
		<>
			<HubNavbar />
			<main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl">
				<Hero />
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
