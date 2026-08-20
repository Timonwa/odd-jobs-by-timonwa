"use client";

import {
	type ComponentType,
	type ReactNode,
	type SVGProps,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

import {
	BookOpenTextIcon,
	HeartIcon,
	HomeIcon,
	LayoutGridIcon,
	MailIcon,
	MenuIcon,
	ShoppingBagIcon,
	TagsIcon,
	XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonClasses, Tooltip, GithubMark } from "@/components/ui";
import { ByokDrawer } from "@/components/_shared/byok";
import { ThemeToggle } from "@/components/_shared/layout";
import { NAV_LINKS, type NavLinkLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { EXTERNAL_ROUTES } from "@/lib/config/routes";

import { NavIconButton } from "./NavIconButton";
import { ToolsMenu } from "./ToolsMenu";

// Icons stay here rather than in the constant — a const whose values are
// React components is UI, so lib/constants holds only the labels and hrefs.
const NAV_LINK_ICONS: Record<
	NavLinkLabel,
	ComponentType<SVGProps<SVGSVGElement>>
> = {
	Home: HomeIcon,
	Tools: LayoutGridIcon,
	Categories: TagsIcon,
	Blog: BookOpenTextIcon,
	Shop: ShoppingBagIcon,
	Newsletter: MailIcon,
};

type NavActionsProps = {
	actionsSlot?: ReactNode;
	menuSlot?: ReactNode;
	repoUrl?: string;
	showByok?: boolean;
};

/** The right side of the Navbar, identical at every breakpoint — Tools switcher, the tool `actionsSlot`, a GitHub link, and a menu button whose dropdown holds nav links plus BYOK/theme/support. The dropdown stays mounted (hidden when closed) so its drawers survive. `menuSlot` renders inside it. */
export function NavActions({
	actionsSlot,
	menuSlot,
	repoUrl = EXTERNAL_ROUTES.repo,
	showByok = true,
}: NavActionsProps) {
	const pathname = usePathname();
	const [openMenu, setOpenMenu] = useState<"tools" | "nav" | null>(null);
	const ref = useRef<HTMLDivElement>(null);
	const menuId = useId();

	useEffect(() => {
		if (!openMenu) return;
		const handleClick = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setOpenMenu(null);
		};
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpenMenu(null);
		};
		document.addEventListener("mousedown", handleClick);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleClick);
			document.removeEventListener("keydown", handleKey);
		};
	}, [openMenu]);

	const toggle = (menu: "tools" | "nav") =>
		setOpenMenu((current) => (current === menu ? null : menu));
	const close = () => setOpenMenu(null);

	const menuRow = cn(
		buttonClasses({ variant: "ghost", size: "sm" }),
		"w-full justify-start",
	);
	const cta = cn(
		buttonClasses({ variant: "outline", size: "sm" }),
		"w-full justify-center",
	);

	return (
		<div ref={ref} className="contents">
			{/* Tools menu */}
			<ToolsMenu
				open={openMenu === "tools"}
				onToggle={() => toggle("tools")}
				onNavigate={close}
			/>

			{/* Tool action (e.g. writing preferences) — kept on the bar at every width.
			    Guarded because an empty wrapper is still a flex item, collecting the
			    row's gap on both sides. */}
			{actionsSlot && <div className="hidden md:block">{actionsSlot}</div>}

			{/* Theme toggle — kept on the bar, between the tool action and GitHub. */}
			<ThemeToggle />

			{/* Support — quiet icon on the bar; the fuller row stays in the menu. */}
			<Tooltip label="Support this project" side="bottom" align="end">
				<a
					href={EXTERNAL_ROUTES.support}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Support this project"
					className={buttonClasses({ variant: "ghost", size: "icon-sm" })}
				>
					<HeartIcon aria-hidden className="h-4 w-4" />
				</a>
			</Tooltip>

			{/* GitHub — kept on the bar at every width. */}
			<Tooltip label="Star on GitHub" side="bottom" align="end">
				<a
					href={repoUrl}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Star on GitHub"
					className={buttonClasses({ variant: "ghost", size: "icon-sm" })}
				>
					<GithubMark aria-hidden className="h-4 w-4" />
				</a>
			</Tooltip>

			{/* Menu dropdown button */}
			<NavIconButton
				onClick={() => toggle("nav")}
				aria-expanded={openMenu === "nav"}
				aria-controls={menuId}
				label={openMenu === "nav" ? "Close menu" : "Open menu"}
				tooltipAlign="end"
			>
				{openMenu === "nav" ? (
					<XIcon aria-hidden className="w-5 h-5" />
				) : (
					<MenuIcon aria-hidden className="w-5 h-5" />
				)}
			</NavIconButton>

			{/* Menu dropdown links */}
			<div
				id={menuId}
				className={cn(
					openMenu === "nav"
						? "absolute right-4 top-full z-50 mt-2 flex max-h-[70vh] w-[min(20rem,calc(100vw-2rem))] flex-col gap-1 overflow-y-auto no-scrollbar rounded-lg border border-border bg-popover p-2 shadow-lg sm:right-6 lg:right-8"
						: "hidden",
				)}
			>
				{NAV_LINKS.map((navLink) => {
					const NavLinkIcon = NAV_LINK_ICONS[navLink.label];
					return (
						<Link
							key={navLink.label}
							href={navLink.href}
							onClick={close}
							// Tells assistive tech which link is the current page; the visual
							// state alone doesn't convey it.
							aria-current={pathname === navLink.href ? "page" : undefined}
							className={menuRow}
						>
							<NavLinkIcon aria-hidden className="w-4 h-4" />
							<span>{navLink.label}</span>
						</Link>
					);
				})}

				{/* Menu slot for page-specific links */}
				{menuSlot}

				{showByok && <ByokDrawer />}

				<ThemeToggle presentation="menuItem" />

				<div className="my-1 border-t border-border/60" />

				<a
					href={EXTERNAL_ROUTES.support}
					target="_blank"
					rel="noopener noreferrer"
					className={cta}
				>
					<HeartIcon aria-hidden className="w-4 h-4" />
					<span>Support this project</span>
				</a>
				<a
					href={repoUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={cta}
				>
					<span aria-hidden>⭐</span>
					<span>Star on GitHub</span>
				</a>
			</div>
		</div>
	);
}
