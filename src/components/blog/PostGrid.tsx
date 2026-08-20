import { ArrowRightIcon, ClockIcon } from "lucide-react";

import { DraftBadge } from "@/components/_shared/content";
import { LinkCard } from "@/components/ui";
import type { PostMeta } from "@/lib/schemas";
import { ROUTES } from "@/lib/config/routes";

export function PostGrid({ posts }: { posts: PostMeta[] }) {
	return (
		<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{posts.map((post) => (
				<li key={post.slug}>
					<LinkCard href={ROUTES.post(post.slug)}>
						<span className="flex items-center gap-2">
							<span className="text-xs font-medium uppercase tracking-wide text-primary">
								{post.category}
							</span>
							<DraftBadge isDraft={post.isDraft} />
						</span>
						<h2 className="mt-2 text-lg font-semibold tracking-tight">
							{post.title}
						</h2>
						<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
							{post.description}
						</p>
						<span className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
							<ClockIcon aria-hidden className="h-3.5 w-3.5" />
							{post.readingMinutes} min read
							<ArrowRightIcon
								aria-hidden
								className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5"
							/>
						</span>
					</LinkCard>
				</li>
			))}
		</ul>
	);
}
