import type { ComponentType, ReactNode, SVGProps } from "react";

import { ToolContent } from "../content/ToolContent";
import { ToolBreadcrumbs } from "../tool/ToolBreadcrumbs";
import { AppNavbar } from "@/components/_shared/layout";
import { PageMain, PageHero } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

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
		</>
	);

	return (
		<>
			<AppNavbar
				brand={{
					href: ROUTES.tool(slug),
					name,
					icon,
					ariaLabel: `${name} home`,
				}}
				showByok={false}
			/>
			<PageMain>
				{constrained ? <div className="mx-auto max-w-3xl">{hero}</div> : hero}
				<ToolContent currentSlug={slug} />
			</PageMain>
		</>
	);
}
