import { AiToolPage } from "@/components/_shared/page";
import { SeoMetaHero } from "./SeoMetaHero";
import { SeoMetaHostedUsageNotice } from "./SeoMetaHostedUsageNotice";
import { SeoMetaTool } from "./SeoMetaTool";

export function ArticleToSeoMetaPageContent() {
	return (
		<AiToolPage
			slug="article-to-seo-meta"
			name="Article to SEO Meta"
			usageNotice={<SeoMetaHostedUsageNotice />}
		>
			<SeoMetaHero />
			<SeoMetaTool />
		</AiToolPage>
	);
}
