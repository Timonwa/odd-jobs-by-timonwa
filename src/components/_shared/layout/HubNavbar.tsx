import { WrenchIcon } from "lucide-react";

import { Navbar } from "./Navbar";
import { SITE_NAME } from "@/lib/config/site";

/** The hub-level navbar — shared brand and actions for non-tool pages (home, blog, 404/error). */
export function HubNavbar() {
	return (
		<Navbar
			brand={{
				href: "/",
				name: SITE_NAME,
				icon: WrenchIcon,
				ariaLabel: `${SITE_NAME} — home`,
			}}
		/>
	);
}
