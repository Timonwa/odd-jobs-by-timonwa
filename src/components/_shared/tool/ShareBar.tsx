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
import { ROUTES } from "@/lib/config/routes";
import { SITE_URL } from "@/lib/config/site";
import { getToolBySlug } from "@/lib/config/tools";
import { COPY_FEEDBACK_MS } from "@/lib/constants";
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

/** Share control — an inline button on the breadcrumb row at `sm+`, and a floating button pinned bottom-right below `sm`; both open the same menu (native Web Share, platform links, email, copy). */
export function ShareBar({ slug, name }: { slug: string; name: string }) {
	const inlineMenuId = useId();
	const fabMenuId = useId();
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const inlineTriggerRef = useRef<HTMLButtonElement>(null);
	const fabTriggerRef = useRef<HTMLButtonElement>(null);

	const url = `${SITE_URL}${ROUTES.tool(slug)}`;
	const tagline = getToolBySlug(slug)?.tagline ?? "";
	const shareText = tagline ? `${name} — ${tagline}` : name;
	const shareData: ShareData = { title: name, text: shareText, url };

	// Web Share is client-only; report false through hydration, then whether this payload is shareable.
	const canNativeShare = useSyncExternalStore(
		noopSubscribe,
		() => canShareData(shareData),
		() => false,
	);

	const forUrl = encodeURIComponent(url);
	const forText = encodeURIComponent(shareText);
	const forTextWithUrl = encodeURIComponent(`${shareText} ${url}`);

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

	const mailtoHref = `mailto:?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`;

	// Close on outside click or Escape; Escape returns focus to the trigger.
	useEffect(() => {
		if (!open) return;
		function onPointerDown(event: PointerEvent) {
			if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
		}
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setOpen(false);
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
	}, [open]);

	async function handleNativeShare() {
		setOpen(false);
		try {
			await navigator.share(shareData);
		} catch {
			// User dismissed the share sheet, or it is unavailable — no-op.
		}
	}

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
		} catch {
			// Clipboard blocked (insecure context / permissions) — no-op.
		}
	}

	const menuClass =
		"z-50 max-h-[80vh] min-w-56 overflow-y-auto no-scrollbar rounded-xl border border-border bg-popover p-1.5 shadow-lg";

	const menuItems = (
		<>
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
			{links.map(({ key, label, Icon, href }) => (
				<li key={key}>
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() => setOpen(false)}
						className={itemClass}
					>
						<Icon aria-hidden className="h-4 w-4 text-muted-foreground" />
						{label}
					</a>
				</li>
			))}
			<li>
				<a
					href={mailtoHref}
					onClick={() => setOpen(false)}
					className={itemClass}
				>
					<MailIcon aria-hidden className="h-4 w-4 text-muted-foreground" />
					Share via email
				</a>
			</li>
			<li>
				<button type="button" onClick={handleCopy} className={itemClass}>
					{copied ? (
						<CheckIcon aria-hidden className="h-4 w-4 text-primary" />
					) : (
						<LinkIcon aria-hidden className="h-4 w-4 text-muted-foreground" />
					)}
					{copied ? "Link copied" : "Copy link"}
				</button>
			</li>
		</>
	);

	return (
		<div ref={containerRef} className="contents">
			{/* sm+: inline button on the breadcrumb row; menu drops down. */}
			<div className="relative hidden sm:block">
				<Button
					ref={inlineTriggerRef}
					onClick={() => setOpen((prev) => !prev)}
					aria-expanded={open}
					aria-controls={inlineMenuId}
					variant="outline"
				>
					<span>Share tool</span>
					<Share2Icon aria-hidden className="h-4 w-4" />
				</Button>
				{open && (
					<ul
						id={inlineMenuId}
						aria-label="Share options"
						className={`absolute right-0 top-full mt-2 ${menuClass}`}
					>
						{menuItems}
					</ul>
				)}
			</div>

			{/* Below sm: floating action button pinned bottom-right; menu drops up. */}
			<div className="fixed bottom-4 right-4 md:right-6 lg:right-8 z-40">
				<Button
					ref={fabTriggerRef}
					onClick={() => setOpen((prev) => !prev)}
					aria-expanded={open}
					aria-controls={fabMenuId}
					aria-label="Share this tool"
					size="icon-lg"
					className="rounded-full shadow-lg"
				>
					<Share2Icon aria-hidden className="h-5 w-5" />
				</Button>
				{open && (
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
	);
}
