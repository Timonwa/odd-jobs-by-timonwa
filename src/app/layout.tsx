import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "@/styles/globals.css";
import { isProduction } from "@env";

import { ScrollToTop } from "@/components/_shared/layout";
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

// Runs before paint, so it can't import anything. The storage key arrives as a
// data attribute rather than interpolated into the source: hardcoding it here
// would drift from STORAGE_KEYS (a mismatch reads as no stored preference and
// repaints once `useTheme` hydrates), and building the script from a variable
// is the code-construction pattern CodeQL flags.
const THEME_INIT = `(function(){var s=document.currentScript,k=s&&s.getAttribute("data-key"),v=k&&localStorage.getItem(k);document.documentElement.classList.toggle("dark",v==="dark"||(v===null&&window.matchMedia("(prefers-color-scheme: dark)").matches));})();`;

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
				<script
					data-key={STORAGE_KEYS.theme}
					dangerouslySetInnerHTML={{ __html: THEME_INIT }}
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ScrollToTop />
				<SiteLayout footer={<HubFooter />}>{children}</SiteLayout>
				{isProduction && (
					<Script
						src="https://cloud.umami.is/script.js"
						data-website-id={siteConfig.umamiWebsiteId}
						data-tag={siteConfig.umamiTag}
						data-performance="true"
						strategy="afterInteractive"
					/>
				)}
			</body>
		</html>
	);
}
