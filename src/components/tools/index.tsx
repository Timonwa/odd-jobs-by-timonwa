import { LayoutGridIcon } from "lucide-react";
import { Suspense } from "react";

import { Newsletter } from "@/components/_shared/content/Newsletter";
import { ToolGrid } from "@/components/_shared/tool/ToolGrid";
import { HubNavbar } from "@/components/layout/HubNavbar";
import { PageMain } from "@/components/layout/PageMain";
import { Breadcrumbs, PageHero } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { LIVE_TOOLS } from "@/lib/config/tools";

import { FilterableTools } from "./FilterableTools";

export function ToolsDirectoryPageContent() {
	return (
		<>
			<HubNavbar />
			<PageMain>
				<Breadcrumbs
					items={[{ label: "Home", href: ROUTES.home }, { label: "Tools" }]}
				/>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: LayoutGridIcon, label: "All tools" }}
					title={
						<>
							Every tool in{" "}
							<span className="hero-gradient-text">one place</span>
						</>
					}
					subtitle="Browse the full collection, or filter by category to find exactly what you need. New tools land here as they ship."
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
