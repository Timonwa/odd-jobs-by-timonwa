"use client";

import { socialPostsRuntime } from "@/lib/config/social-posts-writer";
import {
	SettingsDrawer,
	type SettingsPresentationType,
} from "@/components/_shared/writer/settings/SettingsDrawer";

/** Article-to-Social-Posts settings drawer — the shared drawer bound to this tool's runtime and brand scope. */
export function SocialPostsSettingsDrawer({
	presentation,
}: {
	presentation?: SettingsPresentationType;
}) {
	return (
		<SettingsDrawer
			runtime={socialPostsRuntime}
			presentation={presentation}
			drawerClassName="tool-article-to-social-posts"
		/>
	);
}
