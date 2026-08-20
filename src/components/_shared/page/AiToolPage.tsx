import type { ReactNode } from "react";

import { ToolContent } from "../content/ToolContent";
import { ToolBreadcrumbs } from "../tool/ToolBreadcrumbs";
import { AppNavbar } from "@/components/_shared/layout";
import { PageMain } from "@/components/ui";

type AiToolPageProps = {
	slug: string;
	name: string;
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
	usageNotice,
	settings,
	menuSlot,
	children,
	showToolContent = true,
}: AiToolPageProps) {
	return (
		<>
			<AppNavbar
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
