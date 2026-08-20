"use client";

import { useEffect, useState } from "react";

import {
	Card,
	CardContent,
	Checkbox,
	CopyButton,
	OutputBlock,
	Textarea,
} from "@/components/ui";
import { HASH_ALGORITHMS, type HashAlgorithm } from "@/lib/constants";
import { hashText } from "@/lib/utils";

type Hashes = Record<HashAlgorithm, string>;

const EMPTY_HASHES = Object.fromEntries(
	HASH_ALGORITHMS.map((algorithm) => [algorithm, ""]),
) as Hashes;

export function HashGeneratorTool() {
	const [input, setInput] = useState("");
	const [uppercase, setUppercase] = useState(false);
	const [hashes, setHashes] = useState<Hashes>(EMPTY_HASHES);

	// Compute off the effect's async path only — setting state synchronously in
	// an effect body triggers cascading renders. Empty input just renders the
	// placeholder (no state write needed), so there's nothing to clear.
	useEffect(() => {
		if (input === "") return;
		let active = true;
		Promise.all(
			HASH_ALGORITHMS.map((algorithm) =>
				hashText(input, algorithm).then(
					(digest) => [algorithm, digest] as const,
				),
			),
		).then((pairs) => {
			if (active) setHashes(Object.fromEntries(pairs) as Hashes);
		});
		return () => {
			active = false;
		};
	}, [input]);

	const format = (digest: string) =>
		uppercase ? digest.toUpperCase() : digest;

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardContent className="flex flex-col gap-3">
					<label htmlFor="hash-input" className="text-sm font-medium">
						Text to hash
					</label>
					<Textarea
						id="hash-input"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type or paste text — hashes update as you type"
						className="min-h-28 font-mono"
					/>
					<Checkbox
						label="Uppercase hex"
						checked={uppercase}
						onChange={(e) => setUppercase(e.target.checked)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="flex flex-col gap-4">
					<dl className="flex flex-col gap-4">
						{HASH_ALGORITHMS.map((algorithm) => {
							const ready = input !== "" && hashes[algorithm] !== "";
							return (
								<div key={algorithm} className="flex flex-col gap-1.5">
									<div className="flex items-center justify-between gap-3">
										<dt className="text-sm font-medium">{algorithm}</dt>
										<CopyButton
											value={ready ? format(hashes[algorithm]) : ""}
										/>
									</div>
									<OutputBlock as="dd">
										{ready ? (
											format(hashes[algorithm])
										) : (
											<span className="text-muted-foreground">
												Hash appears here
											</span>
										)}
									</OutputBlock>
								</div>
							);
						})}
					</dl>
				</CardContent>
			</Card>
		</div>
	);
}
