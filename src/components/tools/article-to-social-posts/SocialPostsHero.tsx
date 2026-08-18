import { Share2Icon } from "lucide-react";

import { PageHero } from "@/components/ui";

export function SocialPostsHero() {
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: Share2Icon, label: "Social post generator" }}
			title={
				<>
					Turn articles into{" "}
					<span className="hero-gradient-text">social media posts</span>
				</>
			}
			subtitle="Paste an article's URL or its text. The agent reads it and writes a post tailored to each network — X, LinkedIn, Threads, Bluesky, Mastodon, and Substack Notes — ready to edit, copy, and share."
		/>
	);
}
