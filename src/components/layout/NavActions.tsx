"use client";

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
import { type ReactNode, useEffect, useId, useRef, useState } from "react";

import { buttonClasses, Tooltip } from "@/components/ui";
import { GithubMark } from "@/components/ui/logos";
import ByokDrawer from "@/components/_shared/byok/ByokDrawer";
import NavIconButton from "./NavIconButton";
import ToolsMenu from "./ToolsMenu";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { ROUTES } from "@/lib/config/routes";
import { REPO_URL, SUPPORT_URL } from "@/lib/config/site";
import { cn } from "@/lib/utils";

type NavActionsProps = {
	actionsSlot?: ReactNode;
	menuSlot?: ReactNode;
	repoUrl?: string;
	showByok?: boolean;
};

/** The right side of the Navbar, identical at every breakpoint — Tools switcher, the tool `actionsSlot`, a GitHub link, and a menu button whose dropdown holds nav links plus BYOK/theme/support. The dropdown stays mounted (hidden when closed) so its drawers survive. `menuSlot` renders inside it. */
export default function NavActions({
	actionsSlot,
	menuSlot,
	repoUrl = REPO_URL,
	showByok = true,
}: NavActionsProps) {
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

			{/* Tool action (e.g. writing preferences) — kept on the bar at every width. */}
			<div className="hidden md:block">{actionsSlot}</div>

			{/* Theme toggle — kept on the bar, between the tool action and GitHub. */}
			<ThemeToggle />

			{/* Support — quiet icon on the bar; the fuller row stays in the menu. */}
			<Tooltip label="Support these free tools" side="bottom" align="end">
				<a
					href={SUPPORT_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Support these free tools"
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
						? "absolute right-4 top-full z-50 mt-2 flex max-h-[70vh] w-[min(20rem,calc(100vw-2rem))] flex-col gap-1 overflow-y-auto no-scrollbar rounded-lg border border-border bg-popover p-2 shadow-lg sm:right-6 lg:right-10"
						: "hidden",
				)}
			>
				<Link href={ROUTES.home} onClick={close} className={menuRow}>
					<HomeIcon aria-hidden className="w-4 h-4" />
					<span>Home</span>
				</Link>

				<Link href={ROUTES.tools} onClick={close} className={menuRow}>
					<LayoutGridIcon aria-hidden className="w-4 h-4" />
					<span>Tools</span>
				</Link>

				<Link href={ROUTES.categories} onClick={close} className={menuRow}>
					<TagsIcon aria-hidden className="w-4 h-4" />
					<span>Categories</span>
				</Link>

				<Link href={ROUTES.blog} onClick={close} className={menuRow}>
					<BookOpenTextIcon aria-hidden className="w-4 h-4" />
					<span>Blog</span>
				</Link>

				<Link href={ROUTES.shop} onClick={close} className={menuRow}>
					<ShoppingBagIcon aria-hidden className="w-4 h-4" />
					<span>Shop</span>
				</Link>

				<Link href={ROUTES.newsletter} onClick={close} className={menuRow}>
					<MailIcon aria-hidden className="w-4 h-4" />
					<span>Newsletter</span>
				</Link>

				{/* Menu slot for page-specific links */}
				{menuSlot}

				{showByok && <ByokDrawer />}

				<ThemeToggle presentation="menuItem" />

				<div className="my-1 border-t border-border/60" />

				<a
					href={SUPPORT_URL}
					target="_blank"
					rel="noopener noreferrer"
					className={cta}
				>
					<HeartIcon aria-hidden className="w-4 h-4" />
					<span>Support</span>
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
