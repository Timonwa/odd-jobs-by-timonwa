import type { MDXComponents } from "mdx/types";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { PostFigure } from "@/components/blog/_shared/PostFigure";
import { OpenKeyPanelButton } from "@/components/blog/_shared/OpenKeyPanelButton";
import { YouTubeEmbed } from "@/components/blog/_shared/YouTubeEmbed";

/**
 * Global MDX element styling for every post, plus the custom components posts
 * can use without importing them. Required by `@next/mdx` in the App Router.
 * Headings/lists/links mirror the tool article styles (see ToolContent) so
 * posts and tool pages read as one system.
 */
const elements: MDXComponents = {
	h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
		<h2
			className="mt-12 scroll-mt-24 text-2xl font-semibold tracking-tight first:mt-0"
			{...props}
		>
			{children}
		</h2>
	),
	h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
		<h3 className="mt-8 text-xl font-semibold tracking-tight" {...props}>
			{children}
		</h3>
	),
	h4: ({ children, ...props }: ComponentPropsWithoutRef<"h4">) => (
		<h4 className="mt-6 text-lg font-semibold" {...props}>
			{children}
		</h4>
	),
	p: (props: ComponentPropsWithoutRef<"p">) => (
		<p className="mt-4 leading-relaxed text-muted-foreground" {...props} />
	),
	ul: (props: ComponentPropsWithoutRef<"ul">) => (
		<ul
			className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground marker:text-muted-foreground/60"
			{...props}
		/>
	),
	ol: (props: ComponentPropsWithoutRef<"ol">) => (
		<ol
			className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground marker:text-muted-foreground/60"
			{...props}
		/>
	),
	li: (props: ComponentPropsWithoutRef<"li">) => (
		<li className="leading-relaxed" {...props} />
	),
	strong: (props: ComponentPropsWithoutRef<"strong">) => (
		<strong className="font-semibold text-foreground" {...props} />
	),
	em: (props: ComponentPropsWithoutRef<"em">) => (
		<em className="italic" {...props} />
	),
	blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
		<blockquote
			className="mt-4 border-l-2 border-primary/40 pl-4 italic text-muted-foreground"
			{...props}
		/>
	),
	hr: () => <hr className="my-10 border-border/60" />,
	a: ({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) => {
		const className =
			"font-medium text-primary underline underline-offset-2 hover:no-underline";
		if (/^https?:\/\//.test(href)) {
			return (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className={className}
					{...props}
				>
					{children}
				</a>
			);
		}
		return (
			<Link href={href as Route} className={className} {...props}>
				{children}
			</Link>
		);
	},
	code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => {
		// Fenced blocks arrive with a `language-*` class (and live inside <pre>);
		// leave those to inherit the <pre> styling. Bare inline code gets a chip.
		if (className?.includes("language-")) {
			return <code className={className} {...props} />;
		}
		return (
			<code
				className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground"
				{...props}
			/>
		);
	},
	pre: (props: ComponentPropsWithoutRef<"pre">) => (
		<pre
			className="mt-4 overflow-x-auto rounded-xl border border-border bg-muted/60 p-4 text-sm leading-relaxed"
			{...props}
		/>
	),
	img: ({ alt = "", ...props }: ComponentPropsWithoutRef<"img">) => (
		// Screenshots should use <PostFigure>; this is a fallback for raw markdown
		// images. `aspect-video` reserves a box when markdown gives no dimensions,
		// so the fallback can't shift the article as it loads; an explicit
		// width/height on the markdown image overrides it.
		// eslint-disable-next-line @next/next/no-img-element
		<img
			className="mt-4 aspect-video h-auto w-full rounded-xl border border-border object-cover"
			alt={alt}
			{...props}
		/>
	),
	table: (props: ComponentPropsWithoutRef<"table">) => (
		<div className="mt-4 overflow-x-auto">
			<table className="w-full border-collapse text-sm" {...props} />
		</div>
	),
	th: (props: ComponentPropsWithoutRef<"th">) => (
		<th
			className="border border-border px-3 py-2 text-left font-semibold"
			{...props}
		/>
	),
	td: (props: ComponentPropsWithoutRef<"td">) => (
		<td
			className="border border-border px-3 py-2 text-muted-foreground"
			{...props}
		/>
	),
};

export function useMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...elements,
		PostFigure,
		OpenKeyPanelButton,
		YouTubeEmbed,
		...components,
	};
}
