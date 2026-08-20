import { MailIcon } from "lucide-react";

import { PageHero } from "@/components/ui";
import { getIndexedSeo, splitHeading } from "@/lib/config/page-seo";

const SEO = getIndexedSeo("newsletter");
const HEADING = splitHeading(SEO.heading);

export function NewsletterHero() {
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: MailIcon, label: SEO.eyebrow }}
			title={
				<>
					{HEADING.lead}
					<span className="hero-gradient-text">{HEADING.accent}</span>
					{HEADING.trail}
				</>
			}
			subtitle={SEO.subtitle}
		/>
	);
}
