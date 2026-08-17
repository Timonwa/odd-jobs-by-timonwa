import { Share2Icon } from "lucide-react";

import { AiToolPage } from "@/components/_shared/page";
import { SocialPostsHero } from "./SocialPostsHero";
import { SocialPostsHostedUsageNotice } from "./SocialPostsHostedUsageNotice";
import { SocialPostsSettingsDrawer } from "./SocialPostsSettingsDrawer";
import { SocialPostsWriter } from "./SocialPostsWriter";

export function ArticleToSocialPostsPageContent() {
	return (
		<AiToolPage
			slug="article-to-social-posts"
			name="Article to Social Posts"
			icon={Share2Icon}
			usageNotice={<SocialPostsHostedUsageNotice />}
			menuSlot={<SocialPostsSettingsDrawer presentation="menuItem" />}
		>
			<SocialPostsHero />
			<SocialPostsWriter />
		</AiToolPage>
	);
}
