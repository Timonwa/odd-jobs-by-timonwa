"use client";

import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";

import {
	Button,
	Card,
	CardContent,
	Checkbox,
	CopyButton,
	Input,
	SegmentedControl,
} from "@/components/ui";
import { generateLorem, type LoremUnit } from "@/lib/utils";

const UNITS: { value: LoremUnit; label: string }[] = [
	{ value: "paragraphs", label: "Paragraphs" },
	{ value: "sentences", label: "Sentences" },
	{ value: "words", label: "Words" },
];

const MAX_COUNT = 100;

const DEFAULTS = {
	unit: "paragraphs" as LoremUnit,
	count: 3,
	startWithLorem: true,
};

// A fixed-seed RNG for the first render so the server-rendered HTML matches the
// initial client render; every later batch uses Math.random via the handlers.
function seededRandom() {
	let state = 0x9e3779b9;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function LoremIpsumTool() {
	const [unit, setUnit] = useState<LoremUnit>(DEFAULTS.unit);
	const [count, setCount] = useState(DEFAULTS.count);
	const [startWithLorem, setStartWithLorem] = useState(DEFAULTS.startWithLorem);
	const [output, setOutput] = useState(() =>
		generateLorem(DEFAULTS, seededRandom()),
	);

	const chooseUnit = (value: LoremUnit) => {
		setUnit(value);
		setOutput(generateLorem({ unit: value, count, startWithLorem }));
	};

	const changeCount = (value: number) => {
		setCount(value);
		setOutput(generateLorem({ unit, count: value, startWithLorem }));
	};

	const toggleStart = (value: boolean) => {
		setStartWithLorem(value);
		setOutput(generateLorem({ unit, count, startWithLorem: value }));
	};

	const regenerate = () =>
		setOutput(generateLorem({ unit, count, startWithLorem }));

	const paragraphs = output.split("\n\n");

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardContent className="flex flex-col gap-5">
					<div className="flex flex-wrap items-end gap-x-8 gap-y-5">
						<fieldset className="flex min-w-0 flex-col gap-2">
							<legend className="mb-2 text-sm font-medium">Generate</legend>
							<SegmentedControl
								value={unit}
								onChange={chooseUnit}
								options={UNITS}
								ariaLabel="Unit"
							/>
						</fieldset>

						<div className="flex flex-col gap-2">
							<label htmlFor="lorem-count" className="text-sm font-medium">
								How many
							</label>
							<Input
								id="lorem-count"
								type="number"
								min={1}
								max={MAX_COUNT}
								value={count}
								onChange={(e) => {
									const next = Number.parseInt(e.target.value, 10);
									changeCount(
										Number.isNaN(next)
											? 1
											: Math.min(MAX_COUNT, Math.max(1, next)),
									);
								}}
								className="w-28"
							/>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
						<Checkbox
							label="Start with “Lorem ipsum…”"
							checked={startWithLorem}
							onChange={(e) => toggleStart(e.target.checked)}
						/>

						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={regenerate}
						>
							<RefreshCwIcon aria-hidden className="h-4 w-4" />
							Regenerate
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex flex-col gap-3">
					<div className="flex items-center justify-between gap-3">
						<span className="text-sm font-medium">Placeholder text</span>
						<CopyButton value={output} />
					</div>
					<div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm leading-relaxed">
						{paragraphs.map((paragraph, i) => (
							<p key={i}>{paragraph}</p>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
