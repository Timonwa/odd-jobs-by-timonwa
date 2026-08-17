import { HostedUsagePill } from "@/components/_shared/result/HostedUsagePill";
import { SEO_META_DAILY_USER_CAP } from "@/lib/constants";
import { getSeoMetaUsage } from "@/lib/server/actions";

export function SeoMetaHostedUsageNotice() {
	return (
		<HostedUsagePill
			perUserDaily={SEO_META_DAILY_USER_CAP}
			getUsage={getSeoMetaUsage}
		/>
	);
}
