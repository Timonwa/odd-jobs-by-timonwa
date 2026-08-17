"use client";

import { PenLineIcon } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import type { WriterRuntime, SocialPostStyle } from "@/lib/types";
import { OPEN_SOCIAL_POST_SETTINGS_EVENT } from "@/lib/constants";
import { TemplatesPicker } from "@/components/_shared/writer";
import { NavIconButton } from "@/components/_shared/layout";
import { Button, Drawer } from "@/components/ui";

import { HashtagsSection } from "./HashtagsSection";
import { WritingStyleControls } from "./WritingStyleControls";

export type SettingsPresentation = "icon" | "menuItem";

type SettingsDrawerProps = {
	runtime: WriterRuntime;
	presentation?: SettingsPresentation;
	drawerClassName?: string;
};

/** Slide-out drawer for a tool's writing style, bound to a tool via runtime; presentation picks the trigger — bar icon or full-width menu row. */
export function SettingsDrawer({
	runtime,
	presentation = "icon",
	drawerClassName,
}: SettingsDrawerProps) {
	const { stores, features } = runtime;
	const [open, setOpen] = useState(false);
	const style = useSyncExternalStore(
		stores.styleStorage.subscribe,
		stores.styleStorage.getSnapshot,
		stores.styleStorage.getServerSnapshot,
	);
	const styleTemplates = runtime.useStyleTemplates();

	// Open on request from the generate form's "Writing style" button. The menu-item
	// instance is the always-mounted listener, so one dispatch opens exactly one drawer.
	useEffect(() => {
		if (presentation !== "menuItem") return;
		const handler = () => setOpen(true);
		window.addEventListener(OPEN_SOCIAL_POST_SETTINGS_EVENT, handler);
		return () =>
			window.removeEventListener(OPEN_SOCIAL_POST_SETTINGS_EVENT, handler);
	}, [presentation]);

	const updateStyle = (patch: Partial<SocialPostStyle>) => {
		stores.styleStorage.set({ ...style, ...patch });
	};

	return (
		<>
			{presentation === "menuItem" ? (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setOpen(true)}
					aria-expanded={open}
					className="w-full justify-start"
				>
					<PenLineIcon aria-hidden className="w-4 h-4" />
					<span>Writing style</span>
				</Button>
			) : (
				<NavIconButton
					label="Writing style"
					tooltipAlign="end"
					onClick={() => setOpen(true)}
					aria-expanded={open}
				>
					<PenLineIcon aria-hidden className="w-4 h-4" />
				</NavIconButton>
			)}

			<Drawer
				open={open}
				onOpenChange={setOpen}
				// The drawer portals to <body>, outside the tool's `--primary`
				// scope, so re-apply the tool class here to keep the accent on-brand.
				className={drawerClassName}
				title={
					<span className="flex items-center gap-2">
						<PenLineIcon aria-hidden className="w-4 h-4 text-primary" />
						Writing style
					</span>
				}
				description="How your posts sound — saved on this device and reusable as style templates."
			>
				<div className="px-4 sm:px-5 py-5 flex flex-col gap-6">
					<TemplatesPicker
						templates={styleTemplates.templates}
						activeTemplateId={styleTemplates.activeId}
						onApply={styleTemplates.apply}
						onSave={styleTemplates.save}
						onDelete={styleTemplates.remove}
						onUpdate={styleTemplates.update}
						onRename={styleTemplates.rename}
						collapsible
					/>

					<div className="border-t border-border/50" />

					<WritingStyleControls prefs={style} onChange={updateStyle} />

					<div className="border-t border-border/50" />

					<HashtagsSection
						prefs={style}
						onChange={updateStyle}
						showRules={features.hashtagRules}
					/>
				</div>
			</Drawer>
		</>
	);
}
