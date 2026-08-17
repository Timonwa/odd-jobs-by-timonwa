import { JsonLdScript } from "@/components/_shared/content/JsonLdScript";
import { Newsletter } from "@/components/_shared/content/Newsletter";
import { HubNavbar } from "@/components/layout/HubNavbar";
import { PageMain } from "@/components/layout/PageMain";
import { getAllPosts } from "@/lib/blog/loader";
import { ROUTES } from "@/lib/config/routes";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";

import { BlogHero } from "./BlogHero";
import { PostGrid } from "./PostGrid";

export function BlogPageContent() {
	const posts = getAllPosts();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `Blog — ${SITE_NAME}`,
		itemListElement: posts.map((p, i) => ({
			"@type": "ListItem",
			position: i + 1,
			url: `${SITE_URL}${ROUTES.post(p.slug)}`,
			name: p.title,
		})),
	};

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
