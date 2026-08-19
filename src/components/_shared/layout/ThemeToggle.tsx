"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { NavIconButton } from "@/components/_shared/layout";
import { Button } from "@/components/ui";
import { type Theme, useTheme } from "@/lib/hooks";

const NEXT: Record<Theme, Theme> = {
	light: "dark",
	dark: "system",
	system: "light",
};

export function ThemeToggle({
	presentation = "icon",
}: {
	presentation?: "icon" | "menuItem";
} = {}) {
	const { theme, resolvedTheme, setTheme } = useTheme();

	const Icon =
		theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

	// Label-in-name (WCAG 2.5.3): where this renders visible text, the accessible
	// name has to contain it, so voice control ("click Theme") can target it.
	const label = `Theme: ${theme}`;

	if (presentation === "menuItem") {
		return (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setTheme(NEXT[theme])}
				aria-label={label}
				className="w-full justify-start"
			>
				<Icon aria-hidden className="w-4 h-4" />
				<span className="capitalize">{theme} mode</span>
			</Button>
		);
	}

	return (
		// A wrapper, not the button's className: a display utility there overrides
		// the inline-flex that centres the icon.
		<span className="hidden md:inline-flex">
			<NavIconButton
				label={label}
				tooltipAlign="end"
				onClick={() => setTheme(NEXT[theme])}
			>
				<Icon aria-hidden className="w-4 h-4" />
			</NavIconButton>
		</span>
	);
}
