import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { HubFooter } from "@/components/_shared/layout/HubFooter";
import { SiteLayout } from "@/components/ui";
import {
	CREATOR_NAME,
	CREATOR_TWITTER,
	CREATOR_URL,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_TITLE,
	UMAMI_WEBSITE_ID,
	SITE_URL,
} from "@/lib/config/site";
import { STORAGE_KEYS } from "@/lib/constants";
import "@/styles/globals.css";
import { isProduction } from "@env";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: SITE_TITLE,
		template: `%s · ${SITE_NAME}`,
	},
	description: SITE_DESCRIPTION,
	applicationName: SITE_NAME,
	authors: [{ name: CREATOR_NAME, url: CREATOR_URL }],
	creator: CREATOR_NAME,
	publisher: CREATOR_NAME,
	alternates: { canonical: "/" },
	openGraph: {
		type: "website",
		url: SITE_URL,
		siteName: SITE_NAME,
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		site: CREATOR_TWITTER,
		creator: CREATOR_TWITTER,
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
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
						data-website-id={UMAMI_WEBSITE_ID}
						data-performance="true"
						strategy="afterInteractive"
					/>
				)}
			</body>
		</html>
	);
}
