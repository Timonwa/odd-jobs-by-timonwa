import { SearchIcon } from "lucide-react";

import { PageHero } from "@/components/ui";

export function SeoMetaHero() {
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: SearchIcon, label: "SEO meta generator" }}
			title={
				<>
					Turn articles into{" "}
					<span className="hero-gradient-text">SEO-ready tags</span>
				</>
			}
			subtitle="Paste an article's URL or its text and get title + description variations in the exact character ranges Google displays — with an optional keyword you want guaranteed in every version."
		/>
	);
}
