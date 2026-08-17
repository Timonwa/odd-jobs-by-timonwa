import { KeyRoundIcon } from "lucide-react";

import { PageHero } from "@/components/ui";
import type { PostMeta } from "@/lib/blog/blog";
import { splitTitle } from "@/lib/content/split-title";

export function PostHero({ post }: { post: PostMeta }) {
	const { lead, accent } = splitTitle(post);
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: KeyRoundIcon, label: post.eyebrow }}
			title={
				lead ? (
					<>
						{lead}
						<span className="hero-gradient-text">{accent}</span>
					</>
				) : (
					post.title
				)
			}
			subtitle={post.description}
		/>
	);
}
