// Shared Open Graph image template rendered by the route og-image handlers.

import { ImageResponse } from "next/og";

import { SITE_DOMAIN } from "@/lib/config/site";

/** Shared canvas + MIME for every OG / Twitter card. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export type OgImageConfig = {
	eyebrow: string;
	titleLead: string;
	titleAccent: string;
	subtitle: string;
	pills: string[];
	accent: string;
	backgroundTint: string;
	titleFontSize?: number;
};

/** Branded 1200×630 social card renderer — shared by every OG/Twitter route; inline styles only because Satori has no external CSS or component support. */
export function renderOgImage(config: OgImageConfig) {
	const {
		eyebrow,
		titleLead,
		titleAccent,
		subtitle,
		pills,
		accent,
		backgroundTint,
		titleFontSize = 120,
	} = config;

	// Keep the whole title on a single line: shrink from the max size by the
	// character count so long names never wrap and break the layout. The canvas
	// is 1200px wide with 80px padding a side (~1040px usable); ~0.58 × size is a
	// safe average glyph width for the bold, tightly-tracked heading.
	const fullTitle = `${titleLead} ${titleAccent}`.replace(/\s+/g, " ").trim();
	const fitted = Math.floor(1040 / (fullTitle.length * 0.58));
	const fontSize = Math.max(56, Math.min(titleFontSize, fitted));
	const titleGap = Math.round(fontSize * 0.26);

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "80px",
				background: `radial-gradient(1000px 600px at 15% 10%, ${backgroundTint} 0%, #0a0a0a 60%)`,
				color: "#fafafa",
				fontFamily: "sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "14px",
					fontSize: "26px",
					color: "#a1a1aa",
				}}
			>
				<div
					style={{
						width: "12px",
						height: "12px",
						borderRadius: "9999px",
						background: accent,
					}}
				/>
				<div style={{ display: "flex" }}>{eyebrow}</div>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
				<div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							flexWrap: "nowrap",
							alignItems: "baseline",
							gap: `${titleGap}px`,
							fontSize: `${fontSize}px`,
							fontWeight: 700,
							lineHeight: 1.0,
							letterSpacing: "-0.04em",
							whiteSpace: "nowrap",
						}}
					>
						<div style={{ display: "flex", whiteSpace: "nowrap" }}>
							{titleLead}
						</div>
						<div
							style={{ display: "flex", whiteSpace: "nowrap", color: accent }}
						>
							{titleAccent}
						</div>
					</div>
					<div
						style={{
							display: "flex",
							fontSize: "38px",
							color: "#d4d4d8",
							lineHeight: 1.3,
							maxWidth: "1000px",
						}}
					>
						{subtitle}
					</div>
				</div>

				<div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
					{pills.map((p) => (
						<div
							key={p}
							style={{
								display: "flex",
								padding: "12px 24px",
								borderRadius: "9999px",
								background: "rgba(255,255,255,0.06)",
								border: "1px solid rgba(255,255,255,0.14)",
								fontSize: "26px",
								color: "#e4e4e7",
							}}
						>
							{p}
						</div>
					))}
				</div>
			</div>

			<div style={{ display: "flex", fontSize: "24px", color: "#a1a1aa" }}>
				{SITE_DOMAIN}
			</div>
		</div>,
		{ ...OG_SIZE },
	);
}
