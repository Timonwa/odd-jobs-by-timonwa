import { HostedUsagePill } from "@/components/_shared/result";
import { SEO_META_DAILY_USER_CAP } from "@/lib/constants";
import { fetchSeoMetaUsage } from "@/lib/server/actions";

export function SeoMetaHostedUsageNotice() {
	return (
		<HostedUsagePill
			perUserDaily={SEO_META_DAILY_USER_CAP}
			getUsage={fetchSeoMetaUsage}
		/>
	);
}
