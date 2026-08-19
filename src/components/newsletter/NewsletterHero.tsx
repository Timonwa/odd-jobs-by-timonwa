import { MailIcon } from "lucide-react";

import { PageHero } from "@/components/ui";
import { NEWSLETTER_PAGE_COPY } from "@/lib/data";

export function NewsletterHero() {
	return (
		<PageHero
			className="mb-10"
			eyebrow={{ icon: MailIcon, label: "Newsletter" }}
			title={
				<>
					New tools, in your <span className="hero-gradient-text">inbox</span>
				</>
			}
			subtitle={NEWSLETTER_PAGE_COPY.description}
		/>
	);
}
