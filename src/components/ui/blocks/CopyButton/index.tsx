"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "../../base/Button";
import { cn } from "@/lib/utils";
import { COPY_FEEDBACK_MS } from "@/lib/constants";

type CopyButtonProps = {
	value: string;
	label?: string;
	copiedLabel?: string;
	size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
	variant?: "default" | "outline" | "secondary" | "ghost";
	className?: string;
	disabled?: boolean;
};

/** Copies `value` to the clipboard with a transient "Copied" confirmation. */
export function CopyButton({
	value,
	label = "Copy",
	copiedLabel = "Copied",
	size = "sm",
	variant = "outline",
	className,
	disabled,
}: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
		} catch {
			// Clipboard blocked (insecure context / permissions) — no-op.
		}
	}

	const Icon = copied ? CheckIcon : CopyIcon;

	return (
		<Button
			variant={variant}
			size={size}
			onClick={handleCopy}
			disabled={disabled || !value}
			aria-label={copied ? copiedLabel : label}
			className={cn(copied && "text-primary", className)}
		>
			<Icon aria-hidden className="w-4 h-4" />
			{copied ? copiedLabel : label}
		</Button>
	);
}
