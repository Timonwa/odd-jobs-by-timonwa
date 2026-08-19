import { LayoutGridIcon } from "lucide-react";
import { Suspense } from "react";

import { Newsletter } from "@/components/_shared/content";
import { ToolGrid } from "@/components/_shared/tool";
import { PageMain, Breadcrumbs, PageHero } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { LIVE_TOOLS } from "@/lib/config/tools";

import { FilterableTools } from "./FilterableTools";

export function ToolsDirectoryPageContent() {
	return (
		<>
			<PageMain>
				<Breadcrumbs
					items={[{ label: "Home", href: ROUTES.home }, { label: "Tools" }]}
				/>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: LayoutGridIcon, label: "All tools" }}
					title={
						<>
							Every <span className="hero-gradient-text">odd job</span>, one
							place
						</>
					}
					subtitle="Each tool does one thing. Browse them all, or filter by category to find the one you came for. New ones land here as they ship."
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
