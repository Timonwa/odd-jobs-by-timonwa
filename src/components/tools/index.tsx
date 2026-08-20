import { Suspense } from "react";

import { LayoutGridIcon } from "lucide-react";

import { Newsletter } from "@/components/_shared/content";
import { ToolGrid } from "@/components/_shared/tool";
import { PageMain, Breadcrumbs, PageHero } from "@/components/ui";
import { getIndexedSeo, splitHeading } from "@/lib/config/page-seo";
import { ROUTES } from "@/lib/config/routes";
import { LIVE_TOOLS } from "@/lib/config/tools";

import { FilterableTools } from "./FilterableTools";

const SEO = getIndexedSeo("tools");
const HEADING = splitHeading(SEO.heading);

export function ToolsDirectoryPageContent() {
	return (
		<>
			<PageMain>
				<Breadcrumbs
					items={[{ label: "Home", href: ROUTES.home }, { label: "Tools" }]}
				/>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: LayoutGridIcon, label: SEO.eyebrow }}
					title={
						<>
							{HEADING.lead}
							<span className="hero-gradient-text">{HEADING.accent}</span>
							{HEADING.trail}
						</>
					}
					subtitle={SEO.subtitle}
				/>

				{/* useSearchParams needs a Suspense boundary; the fallback shows the
				    full, unfiltered grid so the tools are in the initial HTML. */}
				<Suspense fallback={<ToolGrid tools={LIVE_TOOLS} />}>
					<FilterableTools />
				</Suspense>

				<Newsletter className="mt-16" />
			</PageMain>
		</>
	);
}
