import { AppNavbar } from "./AppNavbar";
import { HubNav } from "./HubNav";

/** The hub-level navbar — section nav and actions for non-tool pages (home, blog, 404/error). */
export function HubNavbar() {
	return <AppNavbar centerSlot={<HubNav />} />;
}
