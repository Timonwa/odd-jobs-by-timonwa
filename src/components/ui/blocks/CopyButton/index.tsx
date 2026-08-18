"use client";

import { CheckIcon, CopyIcon } from "lucide-react";

import { Button } from "../../base/Button";
import { useCopyFeedback } from "@/lib/hooks";
import { cn } from "@/lib/utils";

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
	const { isCopied, copy } = useCopyFeedback();
	const copied = isCopied();

	// A blocked clipboard (insecure context / permissions) simply shows no
	// confirmation — there is no room for an error message on an icon button.
	const handleCopy = () => copy(value);

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
