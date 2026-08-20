import type { ReactNode } from "react";

import { SupportNote } from "../content";
import { ToolContent } from "../content/ToolContent";
import { ToolBreadcrumbs } from "../tool/ToolBreadcrumbs";
import { AppNavbar, HubNav } from "@/components/_shared/layout";
import { PageMain, PageHero } from "@/components/ui";
import type { IconComponent } from "@/lib/types";

type ClientToolPageProps = {
	slug: string;
	name: string;
	icon: IconComponent;
	eyebrowLabel: string;
	title: ReactNode;
	subtitle: string;
	constrained?: boolean;
	children: ReactNode;
};

/** Page shell for client-only (no-API) tools: navbar, hero, tool, then SEO content (AI tools use AiToolPage). */
export function ClientToolPage({
	slug,
	name,
	icon,
	eyebrowLabel,
	title,
	subtitle,
	constrained,
	children,
}: ClientToolPageProps) {
	const hero = (
		<>
			<ToolBreadcrumbs slug={slug} name={name} />
			<PageHero
				className="mb-10"
				eyebrow={{ icon, label: eyebrowLabel }}
				title={title}
				subtitle={subtitle}
			/>
			{children}
			<SupportNote
				className="mt-6"
				lead="This tool runs in your browser, free and open source."
			/>
		</>
	);

	return (
		<>
			<AppNavbar centerSlot={<HubNav section="Tools" />} showByok={false} />
			<PageMain>
				{constrained ? <div className="mx-auto max-w-3xl">{hero}</div> : hero}
				<ToolContent currentSlug={slug} />
			</PageMain>
		</>
	);
}
