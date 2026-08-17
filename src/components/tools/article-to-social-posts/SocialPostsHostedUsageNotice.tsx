import { HostedUsagePill } from "@/components/_shared/result";
import { SOCIAL_POST_DAILY_USER_CAP } from "@/lib/constants";
import { fetchSocialPostsUsage } from "@/lib/server/actions";

export function SocialPostsHostedUsageNotice() {
	return (
		<HostedUsagePill
			perUserDaily={SOCIAL_POST_DAILY_USER_CAP}
			getUsage={fetchSocialPostsUsage}
		/>
	);
}
