import type { ReactNode } from "react";

import { HubNavbar } from "@/components/_shared/layout";

/**
 * Shell for the hub pages — home, the tools directory, categories, blog,
 * newsletter, and shop.
 *
 * The navbar lives here rather than in each page so it persists across
 * navigation instead of remounting: twelve page components rendered it
 * individually before. Tool routes keep their own `AppNavbar` (per-tool brand
 * and actions), which is why this is a group layout and not the root one.
 */
export default function HubLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<HubNavbar />
			{children}
		</>
	);
}
