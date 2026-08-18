import { JsonLdScript, Newsletter } from "@/components/_shared/content";
import { HubNavbar } from "@/components/_shared/layout";
import { PageMain } from "@/components/ui";
import { getAllPosts } from "@/lib/server";
import { ROUTES } from "@/lib/config/routes";
import { buildItemListJsonLd } from "@/lib/utils";

import { BlogHero } from "./BlogHero";
import { PostGrid } from "./PostGrid";

export function BlogPageContent() {
	const posts = getAllPosts();
	const jsonLd = buildItemListJsonLd(
		"Blog",
		posts.map((p) => ({ href: ROUTES.post(p.slug), title: p.title })),
	);

	return (
		<>
			<HubNavbar />
			<PageMain>
				<BlogHero />
				<PostGrid posts={posts} />
				<Newsletter className="mt-16" />
				<JsonLdScript data={jsonLd} />
			</PageMain>
		</>
	);
}
