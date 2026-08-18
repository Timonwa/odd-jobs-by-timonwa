import type { ReactNode } from "react";

import { ToolContent } from "../content/ToolContent";
import { ToolBreadcrumbs } from "../tool/ToolBreadcrumbs";
import { AppNavbar } from "@/components/_shared/layout";
import { PageMain } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import type { IconComponent } from "@/lib/types";

type AiToolPageProps = {
	slug: string;
	name: string;
	icon: IconComponent;
	usageNotice: ReactNode;
	settings?: ReactNode;
	menuSlot?: ReactNode;
	children: ReactNode;
	// SEO content block below the tool (per-slug MDX). Off for unlisted tools with no MDX.
	showToolContent?: boolean;
};

/** Page shell for the AI tools: navbar with usage notice, BYOK, optional settings drawer, then the tool + (optional) SEO content. */
export function AiToolPage({
	slug,
	name,
	icon,
	usageNotice,
	settings,
	menuSlot,
	children,
	showToolContent = true,
}: AiToolPageProps) {
	return (
		<>
			<AppNavbar
				brand={{
					href: ROUTES.tool(slug),
					name,
					icon,
					ariaLabel: `${name} home`,
				}}
				centerSlot={usageNotice}
				actionsSlot={settings}
				menuSlot={menuSlot}
			/>
			<PageMain>
				<ToolBreadcrumbs slug={slug} name={name} />
				{children}
				{showToolContent && <ToolContent currentSlug={slug} />}
			</PageMain>
		</>
	);
}
