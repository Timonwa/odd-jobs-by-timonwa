"use client";

import { useMemo, useState } from "react";

import {
	Button,
	Card,
	CardContent,
	CopyButton,
	Textarea,
	ToggleButton,
} from "@/components/ui";
import { CASE_GROUPS, type CaseId, convertCase } from "@/lib/utils";

const ALL_CASES = CASE_GROUPS.flatMap((g) => g.cases);

export function CaseConverterTool() {
	// Local-only: case conversion is for short strings/titles/code, not an
	// article draft, so this tool opts out of the cross-tool shared draft.
	const [text, setText] = useState("");
	const [active, setActive] = useState<CaseId>("title-ap");

	const output = useMemo(() => convertCase(text, active), [text, active]);
	const activeMeta = ALL_CASES.find((c) => c.id === active);

	return (
		// Grid areas let one markup order reflow: input → selector → output stacked
		// on small; selector spanning the top with input | output below on large.
		<div className="grid grid-cols-1 gap-4 [grid-template-areas:'input'_'selector'_'output'] lg:grid-cols-2 lg:gap-6 lg:[grid-template-areas:'selector_selector'_'input_output']">
			<Card className="min-w-0 self-start [grid-area:input]">
				<CardContent className="flex flex-col gap-3">
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between gap-3">
							<label htmlFor="case-input" className="text-sm font-medium">
								Your text
							</label>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setText("")}
								disabled={!text}
							>
								Clear
							</Button>
						</div>
						<Textarea
							id="case-input"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Type or paste text to convert…"
							className="min-h-40 max-h-96 overflow-y-auto no-scrollbar"
						/>
					</div>
				</CardContent>
			</Card>

			<div className="flex flex-col gap-6 [grid-area:selector]">
				{CASE_GROUPS.map((group) => {
					return (
						<fieldset key={group.id} className="border-0 p-0 m-0 min-w-0">
							<legend className="mb-2 flex items-center gap-2 text-sm font-medium">
								<span aria-hidden className="text-base">
									{group.icon}
								</span>
								{group.label}
								<span className="text-muted-foreground">
									({group.cases.length})
								</span>
							</legend>
							<div className="flex flex-wrap gap-2">
								{group.cases.map((c) => (
									<ToggleButton
										key={c.id}
										active={active === c.id}
										aria-pressed={active === c.id}
										title={c.description}
										onClick={() => setActive(c.id)}
									>
										<span aria-hidden>{c.icon}</span>
										{c.label}
									</ToggleButton>
								))}
							</div>
						</fieldset>
					);
				})}
			</div>

			<Card className="min-w-0 self-start [grid-area:output]">
				<CardContent className="flex flex-col gap-3">
					<div className="flex items-center justify-between gap-3">
						<span className="text-sm font-medium">
							Result{" "}
							{activeMeta && (
								<span className="font-normal text-muted-foreground">
									· {activeMeta.label}
								</span>
							)}
						</span>
						<CopyButton value={output} />
					</div>
					<Textarea
						readOnly
						value={output}
						placeholder="Converted text appears here…"
						aria-label={activeMeta ? `${activeMeta.label} result` : "Result"}
						className="min-h-40 max-h-96 overflow-y-auto no-scrollbar bg-muted/40"
					/>
				</CardContent>
			</Card>
		</div>
	);
}
