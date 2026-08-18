import { ImageIcon } from "lucide-react";
import Image from "next/image";

type PostFigureProps = {
	src?: string;
	alt?: string;
	caption: string;
	/** Intrinsic size, so the browser can reserve the box before the file loads. Defaults to the shape every screenshot in `public/blog/` actually is. */
	width?: number;
	height?: number;
};

/** A screenshot slot for guide pages — renders the image when `src` is provided, or a labeled placeholder so the layout stays intact during authoring. */
export function PostFigure({
	src,
	alt,
	caption,
	width = 2704,
	height = 1458,
}: PostFigureProps) {
	return (
		<figure className="mt-6">
			{src ? (
				// Real dimensions, not 0/0: the ratio is what lets the browser reserve
				// the space, so six lazy screenshots no longer shove the article down as
				// they arrive. `h-auto w-full` still scales it to the column.
				<Image
					src={src}
					alt={alt ?? caption}
					width={width}
					height={height}
					sizes="(max-width: 768px) 100vw, 720px"
					className="h-auto w-full rounded-xl border border-border"
				/>
			) : (
				<div className="flex aspect-[2704/1458] w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-6 text-center text-muted-foreground">
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
