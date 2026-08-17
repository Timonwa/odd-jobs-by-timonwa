import { ImageIcon } from "lucide-react";
import Image from "next/image";

type PostFigureProps = {
	src?: string;
	alt?: string;
	caption: string;
};

/** A screenshot slot for guide pages — renders the image when `src` is provided, or a labeled placeholder so the layout stays intact during authoring. */
export function PostFigure({ src, alt, caption }: PostFigureProps) {
	return (
		<figure className="mt-6">
			{src ? (
				<Image
					src={src}
					alt={alt ?? caption}
					width={0}
					height={0}
					sizes="(max-width: 768px) 100vw, 720px"
					className="h-auto w-full rounded-xl border border-border"
				/>
			) : (
				<div className="flex aspect-16/10 w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-6 text-center text-muted-foreground">
					<ImageIcon aria-hidden className="h-8 w-8 opacity-60" />
					<span className="text-sm font-medium">Screenshot</span>
					<span className="text-xs">{caption}</span>
				</div>
			)}
			<figcaption className="mt-2 text-center text-sm text-muted-foreground">
				{caption}
			</figcaption>
		</figure>
	);
}
