import { PlayCircleIcon } from "lucide-react";

type YouTubeEmbedProps = {
	id: string;
	title: string;
};

/** A privacy-friendly (youtube-nocookie) 16:9 embed for guide pages; renders a "coming soon" placeholder when `id` is empty so the guide still previews. */
export function YouTubeEmbed({ id, title }: YouTubeEmbedProps) {
	return (
		<div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/40">
			{id ? (
				<iframe
					className="absolute inset-0 h-full w-full"
					src={`https://www.youtube-nocookie.com/embed/${id}`}
					title={title}
					loading="lazy"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					referrerPolicy="strict-origin-when-cross-origin"
					allowFullScreen
				/>
			) : (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
					<PlayCircleIcon aria-hidden className="h-10 w-10 opacity-60" />
					<span className="text-sm font-medium">Video coming soon</span>
					<span className="text-xs">{title}</span>
				</div>
			)}
		</div>
	);
}
