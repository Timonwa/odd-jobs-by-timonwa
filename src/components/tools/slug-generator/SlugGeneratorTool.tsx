"use client";

import { useMemo, useState } from "react";

import {
	Card,
	CardContent,
	Checkbox,
	CopyButton,
	Input,
	OutputBlock,
	SegmentedControl,
} from "@/components/ui";
import { TINT_TEXT } from "@/lib/config/tints";
import { slugify, type SlugSeparator } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SEPARATORS: { value: SlugSeparator; label: string }[] = [
	{ value: "-", label: "hyphen ( - )" },
	{ value: "_", label: "underscore ( _ )" },
];

// Slugs have no hard limit, but shorter ones read better and don't get
// truncated in search results — a soft target, surfaced gently (not an error).
const SLUG_LENGTH_TARGET = 60;

export function SlugGeneratorTool() {
	const [title, setTitle] = useState("");
	const [separator, setSeparator] = useState<SlugSeparator>("-");
	const [lowercase, setLowercase] = useState(true);
	const [removeStopWords, setRemoveStopWords] = useState(false);

	const slug = useMemo(
		() => slugify(title, { separator, lowercase, removeStopWords }),
		[title, separator, lowercase, removeStopWords],
	);

	const slugLength = slug.length;
	const wordCount = slug ? slug.split(separator).filter(Boolean).length : 0;
	const overTarget = slugLength > SLUG_LENGTH_TARGET;

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<label htmlFor="slug-input" className="text-sm font-medium">
							Title or text
						</label>
						<Input
							id="slug-input"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="10 Ways to Improve Your Writing"
						/>
					</div>

					<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
						<fieldset className="flex min-w-0 items-center flex-wrap gap-2">
							<legend className="sr-only">Separator</legend>
							<span className="text-sm text-muted-foreground">Separator</span>
							<SegmentedControl
								value={separator}
								onChange={setSeparator}
								options={SEPARATORS}
								ariaLabel="Separator"
							/>
						</fieldset>
						<Checkbox
							label="Lowercase"
							checked={lowercase}
							onChange={(e) => setLowercase(e.target.checked)}
						/>
						<Checkbox
							label="Remove stop words"
							checked={removeStopWords}
							onChange={(e) => setRemoveStopWords(e.target.checked)}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex flex-col gap-3">
					<div className="flex items-center justify-between gap-3">
						<span className="text-sm font-medium">Slug</span>
						<CopyButton value={slug} />
					</div>
					<OutputBlock className="min-h-9">
						{slug || (
							<span className="text-muted-foreground">
								your-slug-appears-here
							</span>
						)}
					</OutputBlock>
					{slug && (
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
							<span
								className={cn(
									"tabular-nums",
									overTarget ? TINT_TEXT[2] : "text-muted-foreground",
								)}
							>
								{slugLength} / {SLUG_LENGTH_TARGET} characters · {wordCount}{" "}
								{wordCount === 1 ? "word" : "words"}
							</span>
							{overTarget && (
								<span className={TINT_TEXT[2]}>
									— shorter slugs read better
								</span>
							)}
						</div>
					)}
					<p className="text-xs text-muted-foreground break-all">
						Preview:{" "}
						<span className="text-foreground">/blog/{slug || "your-slug"}</span>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
