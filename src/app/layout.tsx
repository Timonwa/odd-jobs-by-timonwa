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

const themeInit = `document.documentElement.classList.toggle("dark", localStorage.theme === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches));`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Tailwind-recommended pre-hydration snippet to avoid theme FOUC */}
				<script dangerouslySetInnerHTML={{ __html: themeInit }} />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SiteLayout footer={<HubFooter />}>{children}</SiteLayout>
				{isProduction && (
					<Script
						defer
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
