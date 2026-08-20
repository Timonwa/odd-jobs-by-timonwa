"use client";

import { CheckIcon, LinkIcon, MailIcon, Share2Icon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import {
	useEffect,
	useId,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";

import {
	BlueskyLogo,
	FacebookLogo,
	LinkedInLogo,
	RedditLogo,
	TelegramLogo,
	ThreadsLogo,
	WhatsAppLogo,
	XLogo,
	Button,
} from "@/components/ui";
import { useCopyFeedback } from "@/lib/hooks";

type ShareLink = {
	key: string;
	label: string;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
	href: string;
};

const noopSubscribe = () => () => {};

// True only when the browser can actually share this payload — some browsers
// expose navigator.share but reject the data (or nothing happens on click).
const canShareData = (data: ShareData) => {
	if (typeof navigator === "undefined" || typeof navigator.share !== "function")
		return false;
	if (typeof navigator.canShare === "function") return navigator.canShare(data);
	return true;
};

const itemClass =
	"flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none";

export type ShareBarProps = {
	/** Absolute URL to share. */
	url: string;
	/** Page title — the share sheet's title and the email subject. */
	title: string;
	/** Sentence shared alongside the URL; falls back to the title alone. */
	shareText?: string;
	/** Noun for the trigger copy, e.g. "tool" → "Share tool" / "Share this tool". */
	subject: string;
};

/** Share control — an inline button on the breadcrumb row at `sm+`, plus a floating button pinned bottom-right at every width. Each trigger owns its own menu (native Web Share, platform links, email, copy); opening one closes the other. */
export function ShareBar({ url, title, shareText, subject }: ShareBarProps) {
	const inlineMenuId = useId();
	const fabMenuId = useId();
	// Which trigger's menu is open, not a boolean: both triggers are visible at
	// `sm+`, and a shared boolean rendered BOTH menus from a single click.
	const [openMenu, setOpenMenu] = useState<"inline" | "fab" | null>(null);
	const { isCopied, copy } = useCopyFeedback();
	const containerRef = useRef<HTMLDivElement>(null);
	const inlineTriggerRef = useRef<HTMLButtonElement>(null);
	const fabTriggerRef = useRef<HTMLButtonElement>(null);

	const closeMenu = () => setOpenMenu(null);
	const text = shareText ?? title;
	const shareData: ShareData = { title, text, url };

	// Web Share is client-only; report false through hydration, then whether this payload is shareable.
	const canNativeShare = useSyncExternalStore(
		noopSubscribe,
		() => canShareData(shareData),
		() => false,
	);

	const forUrl = encodeURIComponent(url);
	const forText = encodeURIComponent(text);
	const forTextWithUrl = encodeURIComponent(`${text} ${url}`);

	const links: ShareLink[] = [
		{
			key: "x",
			label: "Share on X",
			Icon: XLogo,
			href: `https://twitter.com/intent/tweet?text=${forText}&url=${forUrl}`,
		},
		{
			key: "linkedin",
			label: "Share on LinkedIn",
			Icon: LinkedInLogo,
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${forUrl}`,
		},
		{
			key: "facebook",
			label: "Share on Facebook",
			Icon: FacebookLogo,
			href: `https://www.facebook.com/sharer/sharer.php?u=${forUrl}`,
		},
		{
			key: "whatsapp",
			label: "Share on WhatsApp",
			Icon: WhatsAppLogo,
			href: `https://wa.me/?text=${forTextWithUrl}`,
		},
		{
			key: "telegram",
			label: "Share on Telegram",
			Icon: TelegramLogo,
			href: `https://t.me/share/url?url=${forUrl}&text=${forText}`,
		},
		{
			key: "reddit",
			label: "Share on Reddit",
			Icon: RedditLogo,
			href: `https://www.reddit.com/submit?url=${forUrl}&title=${forText}`,
		},
		{
			key: "bluesky",
			label: "Share on Bluesky",
			Icon: BlueskyLogo,
			href: `https://bsky.app/intent/compose?text=${forTextWithUrl}`,
		},
		{
			key: "threads",
			label: "Share on Threads",
			Icon: ThreadsLogo,
			href: `https://www.threads.net/intent/post?text=${forTextWithUrl}`,
		},
	];

	const mailtoHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;

	// Close on outside click or Escape; Escape returns focus to the trigger.
	useEffect(() => {
		if (openMenu === null) return;
		function onPointerDown(event: PointerEvent) {
			if (!containerRef.current?.contains(event.target as Node)) closeMenu();
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				closeMenu();
				// Return focus to whichever trigger is currently visible.
				const trigger = [inlineTriggerRef.current, fabTriggerRef.current].find(
					(el) => el && el.offsetParent !== null,
				);
				trigger?.focus();
			}
		}
		document.addEventListener("pointerdown", onPointerDown);
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [openMenu]);

	async function handleNativeShare() {
		closeMenu();
		try {
			await navigator.share(shareData);
		} catch {
			// User dismissed the share sheet, or it is unavailable — no-op.
		}
	}

	// A blocked clipboard shows no confirmation; the menu has nowhere to put an
	// error, and the URL is visible in the address bar anyway.
	const handleCopy = () => copy(url);

	const menuClass =
		"z-50 max-h-[80vh] min-w-56 overflow-y-auto no-scrollbar rounded-xl border border-border bg-popover p-1.5 shadow-lg";

	const menuItems = (
		<>
			<li>
				<button type="button" onClick={handleCopy} className={itemClass}>
					{isCopied() ? (
						<CheckIcon aria-hidden className="h-4 w-4 text-primary" />
					) : (
						<LinkIcon aria-hidden className="h-4 w-4 text-muted-foreground" />
					)}
					{isCopied() ? "Link copied" : "Copy link"}
				</button>
			</li>
			{links.map(({ key, label, Icon, href }) => (
				<li key={key}>
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						onClick={closeMenu}
						className={itemClass}
					>
						<Icon aria-hidden className="h-4 w-4 text-muted-foreground" />
						{label}
					</a>
				</li>
			))}
			<li>
				<a href={mailtoHref} onClick={closeMenu} className={itemClass}>
					<MailIcon aria-hidden className="h-4 w-4 text-muted-foreground" />
					Share via email
				</a>
			</li>
			{canNativeShare && (
				<li>
					<button
						type="button"
						onClick={handleNativeShare}
						className={itemClass}
					>
						<Share2Icon aria-hidden className="h-4 w-4 text-muted-foreground" />
						Share via your device
					</button>
				</li>
			)}
		</>
	);

	return (
		<div ref={containerRef} className="contents">
			{/* sm+: inline button on the breadcrumb row; menu drops down. */}
			<div className="relative hidden sm:block">
				<Button
					ref={inlineTriggerRef}
					onClick={() =>
						setOpenMenu((prev) => (prev === "inline" ? null : "inline"))
					}
					aria-expanded={openMenu === "inline"}
					aria-controls={inlineMenuId}
					variant="outline"
				>
					<span>Share {subject}</span>
					<Share2Icon aria-hidden className="h-4 w-4" />
				</Button>
				{openMenu === "inline" && (
					<ul
						id={inlineMenuId}
						aria-label="Share options"
						className={`absolute right-0 top-full mt-2 ${menuClass}`}
					>
						{menuItems}
					</ul>
				)}
			</div>

			{/* Mirrors PageMain's container so the button tracks the content's right
			    edge, not the viewport's — same pattern as StickyCheckout. */}
			<div className="pointer-events-none fixed inset-x-0 bottom-6 z-40">
				<div className="container mx-auto flex max-w-6xl justify-end px-4 sm:px-6 lg:px-8">
					<div className="pointer-events-auto relative">
						<Button
							ref={fabTriggerRef}
							onClick={() =>
								setOpenMenu((prev) => (prev === "fab" ? null : "fab"))
							}
							aria-expanded={openMenu === "fab"}
							aria-controls={fabMenuId}
							aria-label={`Share this ${subject}`}
							size="icon-lg"
							className="rounded-full shadow-lg"
						>
							<Share2Icon aria-hidden className="h-5 w-5" />
						</Button>
						{openMenu === "fab" && (
							<ul
								id={fabMenuId}
								aria-label="Share options"
								className={`absolute bottom-full right-0 mb-2 ${menuClass}`}
							>
								{menuItems}
							</ul>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
