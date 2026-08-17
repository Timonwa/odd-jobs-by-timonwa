import { ArrowRightIcon, ClockIcon } from "lucide-react";
import Link from "next/link";

import { buttonClasses, LinkCard } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { getAllPosts } from "@/lib/blog/loader";

export default function LatestPosts() {
	const posts = getAllPosts().slice(0, 3);
	if (posts.length === 0) return null;

	return (
		<section aria-labelledby="latest-posts-heading" className="section">
			<div className="flex items-center justify-between gap-4">
				<h2
					id="latest-posts-heading"
					className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
				>
					From the blog
				</h2>
				<Link
					href={ROUTES.blog}
					className={buttonClasses({ variant: "outline", size: "sm" })}
				>
					Read the blog
					<ArrowRightIcon aria-hidden className="h-4 w-4" />
				</Link>
			</div>

			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{posts.map((post) => (
					<li key={post.slug}>
						<LinkCard href={ROUTES.post(post.slug)}>
							<span className="text-xs font-medium uppercase tracking-wide text-primary">
								{post.category}
							</span>
							<h3 className="mt-2 text-lg font-semibold tracking-tight">
								{post.title}
							</h3>
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
		</section>
	);
}
