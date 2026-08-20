import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "@/styles/globals.css";
import { isProduction } from "@env";

import { HubFooter } from "@/components/_shared/layout/HubFooter";
import { SiteLayout } from "@/components/ui";
import { STORAGE_KEYS } from "@/lib/constants";
import { siteConfig } from "@/lib/config/site";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.title,
		template: `%s · ${siteConfig.name}`,
	},
	description: siteConfig.description,
	applicationName: siteConfig.name,
	authors: [{ name: siteConfig.creator.name, url: siteConfig.creator.url }],
	creator: siteConfig.creator.name,
	publisher: siteConfig.creator.name,
	alternates: { canonical: "/" },
	openGraph: {
		type: siteConfig.defaultSiteType,
		url: siteConfig.url,
		siteName: siteConfig.name,
		title: siteConfig.title,
		description: siteConfig.description,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		site: siteConfig.twitter,
		creator: siteConfig.twitter,
		title: siteConfig.title,
		description: siteConfig.description,
	},
	robots: { index: true, follow: true },
	category: "technology",
};

// Runs before paint, so it can't import anything — the key is interpolated from
// STORAGE_KEYS rather than written out, since a mismatch here reads as no stored
// preference and repaints once `useTheme` hydrates.
const themeInit = `(function(){var k=${JSON.stringify(STORAGE_KEYS.theme)},v=localStorage.getItem(k);document.documentElement.classList.toggle("dark",v==="dark"||(v===null&&window.matchMedia("(prefers-color-scheme: dark)").matches));})();`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* The analytics script loads after hydration, so warming the
				    connection early saves its DNS + TLS round-trips. */}
				<link rel="preconnect" href="https://cloud.umami.is" crossOrigin="" />
				{/* Tailwind-recommended pre-hydration snippet to avoid theme FOUC */}
				<script dangerouslySetInnerHTML={{ __html: themeInit }} />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SiteLayout footer={<HubFooter />}>{children}</SiteLayout>
				{isProduction && (
					<Script
						src="https://cloud.umami.is/script.js"
						data-website-id={siteConfig.umamiWebsiteId}
						data-performance="true"
						strategy="afterInteractive"
					/>
				)}
			</body>
		</html>
	);
}
