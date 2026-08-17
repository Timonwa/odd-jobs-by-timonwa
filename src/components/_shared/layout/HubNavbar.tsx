import { WrenchIcon } from "lucide-react";

import { AppNavbar } from "./AppNavbar";
import { SITE_NAME } from "@/lib/config/site";

/** The hub-level navbar — shared brand and actions for non-tool pages (home, blog, 404/error). */
export function HubNavbar() {
	return (
		<AppNavbar
			brand={{
				href: "/",
				name: SITE_NAME,
				icon: WrenchIcon,
				ariaLabel: `${SITE_NAME} — home`,
			}}
		/>
	);
}
