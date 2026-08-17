"use client";

import Editor from "react-simple-code-editor";
import { highlight } from "sugar-high";

import { cn } from "@/lib/utils";

type CodeEditorProps = {
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	textareaId?: string;
	className?: string;
};

/** Editable, syntax-highlighted code field (react-simple-code-editor + sugar-high). */
export function CodeEditor({
	value,
	onValueChange,
	placeholder,
	textareaId,
	className,
}: CodeEditorProps) {
	return (
		<div
			className={cn(
				"h-96 w-full min-w-0 overflow-auto no-scrollbar rounded-md border border-border bg-background font-mono text-sm focus-within:ring-2 focus-within:ring-primary",
				className,
			)}
		>
			<Editor
				value={value}
				onValueChange={onValueChange}
				highlight={(code) => highlight(code)}
				textareaId={textareaId}
				placeholder={placeholder}
				spellCheck={false}
				padding={12}
				className="sugar-high"
				style={{
					fontFamily: "inherit",
					fontSize: "inherit",
					minHeight: "100%",
				}}
			/>
		</div>
	);
}
