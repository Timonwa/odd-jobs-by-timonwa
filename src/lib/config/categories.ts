// Tool category registry — ids, labels, and brand colors used to group tools.

import {
	CodeIcon,
	ImageIcon,
	PenLineIcon,
	SearchIcon,
	SparklesIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { type Tint, TINT_HOVER_BORDER, TINT_ICON, TINT_SURFACE } from "./tints";

export type CategoryId = "writing" | "ai" | "seo" | "developer" | "media";

export type CategoryColor = {
	badge: string;
	chip: string;
	border: string;
};

const colorForTint = (tint: Tint): CategoryColor => ({
	badge: TINT_SURFACE[tint],
	chip: TINT_ICON[tint],
	border: TINT_HOVER_BORDER[tint],
});

export type Category = {
	id: CategoryId;
	label: string;
	description: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	tint: Tint;
	color: CategoryColor;
};

/** Display order for filter chips and the browse-by-category grid. */
export const TOOL_CATEGORIES: Category[] = [
	{
		id: "writing",
		label: "Writing",
		description: "Draft, edit, and shape words — from counts to clean copy.",
		icon: PenLineIcon,
		tint: 1,
		color: colorForTint(1),
	},
	{
		id: "ai",
		label: "AI",
		description:
			"AI generators that turn an article into ready-to-use content.",
		icon: SparklesIcon,
		tint: 3,
		color: colorForTint(3),
	},
	{
		id: "seo",
		label: "SEO",
		description: "Get found: titles, slugs, and metadata sized for search.",
		icon: SearchIcon,
		tint: 4,
		color: colorForTint(4),
	},
	{
		id: "developer",
		label: "Developer",
		description: "Quick, dependable utilities for everyday coding tasks.",
		icon: CodeIcon,
		tint: 2,
		color: colorForTint(2),
	},
	{
		id: "media",
		label: "Media",
		description: "Images, share cards, and assets for publishing a post.",
		icon: ImageIcon,
		tint: 5,
		color: colorForTint(5),
	},
];

const BY_ID = new Map(TOOL_CATEGORIES.map((c) => [c.id, c]));

/** Look up a category by ID, throwing if the ID isn't registered. */
export const getCategory = (id: CategoryId): Category => {
	const category = BY_ID.get(id);
	if (!category) throw new Error(`Unknown tool category: ${id}`);
	return category;
};
