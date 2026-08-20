import { KeyRoundIcon } from "lucide-react";

import { ContentByline, DraftBadge } from "@/components/_shared/content";
import { PageHero } from "@/components/ui";
import type { PostMeta } from "@/lib/schemas";
import { splitTitle } from "@/lib/utils";

export function PostHero({ post }: { post: PostMeta }) {
	const { lead, accent } = splitTitle(post);
	return (
		// The margin moves to the wrapper so the byline sits directly under the
		// title rather than below the hero's spacing.
		<div className="mb-10">
			{post.isDraft && (
				<div className="mb-4 flex justify-center">
					<DraftBadge isDraft={post.isDraft} />
				</div>
			)}
			<PageHero
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
			<ContentByline
				publishedAt={post.publishedAt}
				updatedAt={post.updatedAt}
				readingMinutes={post.readingMinutes}
			/>
		</div>
	);
}
