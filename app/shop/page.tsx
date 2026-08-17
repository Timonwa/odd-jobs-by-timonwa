import { ArrowRightIcon, ShoppingBagIcon } from "lucide-react";
import type { Metadata } from "next";

import HubNavbar from "@/components/layout/HubNavbar";
import PageMain from "@/components/layout/PageMain";
import Newsletter from "@/components/_shared/content/Newsletter";
import { LinkCard, PageHero } from "@/components/ui";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { ROUTES } from "@/lib/config/routes";
import { getAllProducts } from "@/lib/shop/loader";

const PATH = ROUTES.shop;
const TITLE = "Shop";
const DESCRIPTION =
	"Digital products to help you get things done — Notion templates and more, built and used by me.";

export const metadata: Metadata = {
	title: TITLE,
	description: DESCRIPTION,
	alternates: { canonical: PATH },
	openGraph: {
		type: "website",
		url: `${SITE_URL}${PATH}`,
		siteName: SITE_NAME,
		title: TITLE,
		description: DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: TITLE,
		description: DESCRIPTION,
	},
};

export default function ShopIndexPage() {
	const products = getAllProducts();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: `Shop — ${SITE_NAME}`,
		itemListElement: products.map((product, i) => ({
			"@type": "ListItem",
			position: i + 1,
			url: `${SITE_URL}${ROUTES.product(product.slug)}`,
			name: product.title,
		})),
	};

	return (
		<>
			<HubNavbar />
			<PageMain>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: ShoppingBagIcon, label: "Shop" }}
					title={
						<>
							Digital products that{" "}
							<span className="hero-gradient-text">get things done</span>
						</>
					}
					subtitle={DESCRIPTION}
				/>

				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => (
						<li key={product.slug}>
							<LinkCard href={ROUTES.product(product.slug)}>
								<span className="flex items-center justify-between gap-2">
									<span className="text-xs font-medium uppercase tracking-wide text-primary">
										{product.category}
									</span>
									{product.price && (
										<span className="text-xs font-semibold text-foreground">
											{product.price}
										</span>
									)}
								</span>
								<h2 className="mt-2 text-lg font-semibold tracking-tight">
									{product.title}
								</h2>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
									{product.description}
								</p>
								<span className="mt-4 flex items-center gap-1.5 text-sm text-primary">
									View details
									<ArrowRightIcon
										aria-hidden
										className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5"
									/>
								</span>
							</LinkCard>
						</li>
					))}
				</ul>

				<Newsletter className="mt-16" />

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</PageMain>
		</>
	);
}
