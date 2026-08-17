"use client";

import {
	ClockIcon,
	FileTextIcon,
	HistoryIcon,
	LinkIcon,
	Trash2Icon,
} from "lucide-react";
import { type ReactNode, useState } from "react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui";
import { timeAgo } from "@/lib/utils";

type HistoryItem = {
	id: string;
	kind: "url" | "text";
	title: string;
	timestamp: number;
	meta?: ReactNode;
};

type Props = {
	items: HistoryItem[];
	onLoad: (id: string) => void;
	onRemove: (id: string) => void;
	description?: string;
	emptyText?: string;
};

const DEFAULT_DESCRIPTION =
	"Your last 10 generations, saved in this browser. Re-generating an article updates its entry — history isn't kept per run.";
const DEFAULT_EMPTY = "Your generations will appear here.";

/** History sidebar for the draft-based AI tools: scrollable list, source badge, two-step remove. */
export function HistorySidebar({
	items,
	onLoad,
	onRemove,
	description = DEFAULT_DESCRIPTION,
	emptyText = DEFAULT_EMPTY,
}: Props) {
	// Two-step remove: the first click arms the confirm, the second removes.
	const [confirmingId, setConfirmingId] = useState<string | null>(null);

	return (
		<aside className="lg:sticky lg:top-20 self-start">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-sm">
						<HistoryIcon className="w-4 h-4" />
						History
					</CardTitle>
					<CardDescription className="text-xs">{description}</CardDescription>
				</CardHeader>
				<CardContent>
					{items.length === 0 ? (
						<p className="text-xs text-muted-foreground">{emptyText}</p>
					) : (
						<ul className="flex flex-col gap-2 max-h-104 overflow-y-auto no-scrollbar pr-1">
							{items.map((item) => {
								const isText = item.kind === "text";
								const Icon = isText ? FileTextIcon : LinkIcon;
								const confirming = confirmingId === item.id;
								return (
									<li
										key={item.id}
										className="group rounded-md border border-border p-2 hover:bg-accent/50 transition-colors"
									>
										<button
											type="button"
											onClick={() => onLoad(item.id)}
											className="w-full text-left"
										>
											<div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
												<Icon aria-hidden className="w-3 h-3" />
												{isText ? "Text" : "URL"}
											</div>
											<div className="text-xs font-medium line-clamp-2 mb-1 wrap-break-word">
												{item.title}
											</div>
											<div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
												<ClockIcon className="w-3 h-3" />
												{timeAgo(item.timestamp)}
												{item.meta}
											</div>
										</button>

										{confirming ? (
											<div className="mt-1 flex items-center gap-2 text-[10px]">
												<button
													type="button"
													onClick={() => {
														onRemove(item.id);
														setConfirmingId(null);
													}}
													className="font-medium text-destructive hover:underline"
												>
													Confirm remove
												</button>
												<button
													type="button"
													onClick={() => setConfirmingId(null)}
													className="text-muted-foreground hover:text-foreground"
												>
													Cancel
												</button>
											</div>
										) : (
											<button
												type="button"
												onClick={() => setConfirmingId(item.id)}
												className="mt-1 text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
											>
												<Trash2Icon className="w-3 h-3" />
												Remove
											</button>
										)}
									</li>
								);
							})}
						</ul>
					)}
				</CardContent>
			</Card>
		</aside>
	);
}
