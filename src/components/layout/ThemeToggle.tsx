"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { NavIconButton } from "@/components/layout/NavIconButton";
import { Button } from "@/components/ui";
import { type ThemeType, useTheme } from "@/lib/hooks";

const NEXT: Record<ThemeType, ThemeType> = {
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
		<NavIconButton
			label={label}
			tooltipAlign="end"
			onClick={() => setTheme(NEXT[theme])}
			className="hidden md:block"
		>
			<Icon aria-hidden className="w-4 h-4" />
		</NavIconButton>
	);
}
