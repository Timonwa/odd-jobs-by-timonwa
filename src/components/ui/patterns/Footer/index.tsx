import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Tooltip } from "../../base/Tooltip";
import type { IconComponent } from "@/lib/types";

type FooterLink = { label: string } & (
	{ href: Route; isExternal?: false } | { href: string; isExternal: true }
);

type FooterProps = {
	brand: { href: Route; name: string; icon: IconComponent };
	tagline: string;
	socialLinks: { label: string; href: string; icon: IconComponent }[];
	columns: { heading: string; links: FooterLink[] }[];
	metaLinks: FooterLink[];
	legalLinks: FooterLink[];
	/** Copyright / attribution line in the bottom bar. */
	bottomNote: ReactNode;
};

const linkClass =
	"text-muted-foreground transition-colors hover:text-foreground";

const iconLinkClass =
	"flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

function FooterAnchor({ link }: { link: FooterLink }) {
	if (link.isExternal) {
		return (
			<a
				href={link.href}
				target="_blank"
				rel="noopener noreferrer"
				className={linkClass}
			>
				{link.label}
			</a>
		);
	}
	return (
		<Link href={link.href} className={linkClass}>
			{link.label}
		</Link>
	);
}

function FooterColumn({
	heading,
	links,
}: {
	heading: string;
	links: FooterLink[];
}) {
	const id = `footer-${heading.toLowerCase()}-heading`;
	return (
		<nav aria-labelledby={id}>
			<h2 id={id} className="text-sm font-semibold text-foreground">
				{heading}
			</h2>
			<ul className="mt-3 flex flex-col gap-2 text-sm">
				{links.map((link) => (
					<li key={link.label}>
						<FooterAnchor link={link} />
					</li>
				))}
			</ul>
		</nav>
	);
}

/** The site footer shell — brand + tagline, social icon row, link columns, meta cross-links, and a bottom bar. The app passes every link in; the shell renders what it is given. */
export function Footer({
	brand,
	tagline,
	socialLinks,
	columns,
	metaLinks,
	legalLinks,
	bottomNote,
}: FooterProps) {
	const BrandIcon = brand.icon;
	return (
		<footer className="border-t border-border/50 bg-background/50">
			<div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid gap-10 lg:grid-cols-12 lg:gap-x-8">
					<div className="lg:col-span-4">
						<Link
							href={brand.href}
							className="inline-flex items-center gap-2 text-base font-semibold"
						>
							<span
								aria-hidden
								className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
							>
								<BrandIcon className="h-5 w-5" />
							</span>
							{brand.name}
						</Link>
						<p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
							{tagline}
						</p>
						<div className="mt-4 flex items-center gap-2">
							{socialLinks.map((social) => {
								const SocialIcon = social.icon;
								return (
									<Tooltip key={social.label} label={social.label}>
										<a
											href={social.href}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={social.label}
											className={iconLinkClass}
										>
											<SocialIcon aria-hidden className="h-4 w-4" />
										</a>
									</Tooltip>
								);
							})}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:col-span-8">
						{columns.map((column) => (
							<FooterColumn
								key={column.heading}
								heading={column.heading}
								links={column.links}
							/>
						))}
					</div>
				</div>

				<nav
					aria-label="More"
					className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-border/40 pt-6 text-sm"
				>
					{metaLinks.map((link) => (
						<FooterAnchor key={link.label} link={link} />
					))}
				</nav>

				<div className="mt-6 flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					{bottomNote}
					<nav aria-label="Legal">
						<ul className="flex items-center gap-x-4">
							{legalLinks.map((link) => (
								<li key={link.label}>
									<FooterAnchor link={link} />
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</footer>
	);
}
