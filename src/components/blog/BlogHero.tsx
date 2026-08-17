import { BookOpenTextIcon } from "lucide-react";

import { PageHero } from "@/components/ui";
import { BLOG_PAGE_COPY } from "@/lib/data";

export function BlogHero() {
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: BookOpenTextIcon, label: "Blog" }}
			title={
				<>
					Getting things done,{" "}
					<span className="hero-gradient-text">made simpler</span>
				</>
			}
			subtitle={BLOG_PAGE_COPY.description}
		/>
	);
}
