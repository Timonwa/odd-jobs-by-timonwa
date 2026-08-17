"use client";

import { Loader2Icon, RefreshCwIcon, TagsIcon } from "lucide-react";

import {
	SEO_META_DESC_MAX,
	SEO_META_DESC_MIN,
	SEO_META_TITLE_MAX,
	SEO_META_TITLE_MIN,
} from "@/lib/constants";
import type { SeoMetaVariation } from "@/lib/types";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CopyButton,
	Textarea,
	Tooltip,
} from "@/components/ui";

import { TINT_SURFACE } from "@/lib/config/tints";
import { cn } from "@/lib/utils";

type RangeStatus = "in-range" | "close" | "out";

function status(len: number, min: number, max: number): RangeStatus {
	if (len >= min && len <= max) return "in-range";
	const delta = len < min ? min - len : len - max;
	return delta <= 5 ? "close" : "out";
}

type Props = {
	variations: SeoMetaVariation[];
	regeneratingIndex: number | null;
	busy: boolean;
	onVariationChange: (
		index: number,
		field: "title" | "description",
		value: string,
	) => void;
	onRegenerate: (index: number) => void;
};

/** Grid of editable SEO variation cards with per-card regenerate and copy actions. */
export function SeoMetaResults({
	variations,
	regeneratingIndex,
	busy,
	onVariationChange,
	onRegenerate,
}: Props) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
			{variations.map((v, i) => (
				<VariationCard
					key={i}
					index={i + 1}
					variation={v}
					isRegenerating={regeneratingIndex === i}
					canRegenerate={!busy}
					onChange={(field, value) => onVariationChange(i, field, value)}
					onRegenerate={() => onRegenerate(i)}
				/>
			))}
		</div>
	);
}

/** Single SEO variation card with editable title and description fields. */
function VariationCard({
	index,
	variation,
	isRegenerating,
	canRegenerate,
	onChange,
	onRegenerate,
}: {
	index: number;
	variation: SeoMetaVariation;
	isRegenerating: boolean;
	canRegenerate: boolean;
	onChange: (field: "title" | "description", value: string) => void;
	onRegenerate: () => void;
}) {
	const titleStatus = status(
		variation.title.length,
		SEO_META_TITLE_MIN,
		SEO_META_TITLE_MAX,
	);
	const descStatus = status(
		variation.description.length,
		SEO_META_DESC_MIN,
		SEO_META_DESC_MAX,
	);

	return (
		<Card className="min-w-0">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<TagsIcon aria-hidden className="w-4 h-4 shrink-0 text-primary" />
					Variation {index}
				</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<Field
					label="Title"
					value={variation.title}
					min={SEO_META_TITLE_MIN}
					max={SEO_META_TITLE_MAX}
					status={titleStatus}
					onChange={(v) => onChange("title", v)}
				/>

				<Field
					label="Description"
					value={variation.description}
					min={SEO_META_DESC_MIN}
					max={SEO_META_DESC_MAX}
					status={descStatus}
					onChange={(v) => onChange("description", v)}
				/>

				<div className="flex gap-2">
					<CopyButton
						label="Copy both"
						value={`Title: ${variation.title}\n\nDescription: ${variation.description}`}
						className="flex-1"
					/>
					<Tooltip label="Regenerate this variation">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onRegenerate}
							disabled={!canRegenerate}
							aria-label="Regenerate this variation"
						>
							{isRegenerating ? (
								<Loader2Icon aria-hidden className="w-4 h-4 animate-spin" />
							) : (
								<RefreshCwIcon aria-hidden className="w-4 h-4" />
							)}
						</Button>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
	);
}

/** Editable textarea for one SEO field with a character-range badge. */
function Field({
	label,
	value,
	min,
	max,
	status,
	onChange,
}: {
	label: string;
	value: string;
	min: number;
	max: number;
	status: RangeStatus;
	onChange: (value: string) => void;
}) {
	const over = value.length > max;
	const under = value.length < min;

	return (
		<div>
			<div className="flex items-center justify-between gap-3 mb-1.5">
				<div className="flex items-center gap-2 min-w-0">
					<span className="text-xs font-medium text-muted-foreground">
						{label}
					</span>
					<span
						className={cn(
							"shrink-0 text-[11px] font-medium tabular-nums rounded-full px-2 py-0.5 border",
							status === "in-range" &&
								"bg-primary/10 text-primary border-primary/30",
							status === "close" && TINT_SURFACE[2],
							status === "out" &&
								"bg-destructive/10 text-destructive border-destructive/30",
						)}
					>
						{value.length} / {min}–{max}
					</span>
				</div>
				<CopyButton label="Copy" value={value} variant="ghost" />
			</div>
			<Textarea
				aria-label={label}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={cn(
					"resize-none text-sm min-h-0",
					(over || under) && "border-destructive focus:ring-destructive",
				)}
			/>
		</div>
	);
}
