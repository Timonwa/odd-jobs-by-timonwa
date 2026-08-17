"use client";

import { KeyRoundIcon } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button, Drawer } from "@/components/ui";
import { ByokSection } from "./ByokSection";

import { type ByokModel, DEFAULT_BYOK_MODEL } from "@/lib/config/byok";
import { OPEN_BYOK_EVENT } from "@/lib/constants";
import { byokModelStorage, byokStorage, subscribeByok } from "@/lib/utils";

/** Hub-level BYOK drawer (one instance in the Navbar); open it by dispatching `OPEN_BYOK_EVENT`. */
export function ByokDrawer() {
	const [open, setOpen] = useState(false);
	// BYOK key + model live in sessionStorage — read them as an external store so
	// same-tab writes and cross-tab storage events keep every reader in sync
	// (no setState-in-effect hydration).
	const saved = useSyncExternalStore(
		subscribeByok,
		() => byokStorage.get(),
		() => null,
	);
	const byokModel = useSyncExternalStore(
		subscribeByok,
		() => byokModelStorage.get(),
		() => DEFAULT_BYOK_MODEL,
	);

	// Open the drawer when any tool requests it (e.g. a "free/day" pill).
	useEffect(() => {
		const handler = () => setOpen(true);
		window.addEventListener(OPEN_BYOK_EVENT, handler);
		return () => window.removeEventListener(OPEN_BYOK_EVENT, handler);
	}, []);

	const handleSave = (input: string) => {
		const trimmed = input.trim();
		// Catch the common copy-paste slips before the key fails mid-generation
		// with a confusing error. Kept permissive so a valid key is never rejected.
		if (!trimmed)
			return { type: "error" as const, message: "Paste your API key first." };
		if (/\s/.test(trimmed))
			return {
				type: "error" as const,
				message:
					"That key has a space in it. Copy the whole key again, with no spaces before or after.",
			};
		if (trimmed.length < 20)
			return {
				type: "error" as const,
				message:
					"That doesn't look like a full API key. Copy the entire key from Google AI Studio and paste it again.",
			};
		// Only claim success if the write actually landed — sessionStorage can be
		// unavailable, and telling someone their key is saved when it isn't sends
		// them back to the hosted quota with no explanation.
		if (!byokStorage.set(trimmed))
			return {
				type: "error" as const,
				message:
					"Your browser blocked storing the key for this tab. Check your privacy settings, or try a normal (non-private) window.",
			};
		return { type: "success" as const, message: "Key saved for this tab." };
	};

	const handleClear = () => {
		const cleared = byokStorage.clear();
		byokModelStorage.clear();
		// The worse direction to get wrong: saying a key was removed when it wasn't.
		return cleared
			? { type: "success" as const, message: "Key cleared." }
			: {
					type: "error" as const,
					message:
						"Your browser blocked clearing the key. Close this tab to end the session.",
				};
	};

	const handleModelChange = (model: ByokModel) => {
		byokModelStorage.set(model);
	};

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setOpen(true)}
				aria-label={saved ? "API key — your own key is active" : "API key"}
				aria-expanded={open}
				className="w-full justify-start"
			>
				<KeyRoundIcon aria-hidden className="w-4 h-4" />
				<span>Set API key</span>
				{saved && (
					<span aria-hidden className="relative ml-auto flex h-2 w-2">
						<span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
						<span className="relative block w-2 h-2 rounded-full bg-primary" />
					</span>
				)}
			</Button>

			<Drawer
				open={open}
				onOpenChange={setOpen}
				title={
					<span className="flex items-center gap-2">
						<KeyRoundIcon aria-hidden className="w-4 h-4 text-primary" />
						Set API key
					</span>
				}
				description="Bring your own Google AI Studio key for every AI tool — handy when the free daily limit runs out."
			>
				<div className="px-4 sm:px-5 py-5">
					<ByokSection
						savedKey={saved}
						byokModel={byokModel}
						onSave={handleSave}
						onClear={handleClear}
						onModelChange={handleModelChange}
					/>
				</div>
			</Drawer>
		</>
	);
}
