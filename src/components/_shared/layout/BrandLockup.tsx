/* eslint-disable @next/next/no-img-element -- Static brand SVGs: nothing for
   next/image to optimise, and routing them through it would mean enabling
   `dangerouslyAllowSVG` for every image in the app. */

/** The brand lockup, served from the exported assets so the navbar and the downloadable logo can never drift. `alt` is empty because the wrapping link names it. */
export function BrandLockup() {
	return (
		<>
			{/* Below `sm` the mark alone — the full lockup crowds the bar's controls.
			    It carries its own blue tile, so one file covers both themes. */}
			<img
				src="/brand-icon.svg"
				alt=""
				width={48}
				height={48}
				className="h-9 w-9 sm:hidden"
			/>

			{/* Full lockup from `sm` up, a variant per theme. */}
			<img
				src="/logo.svg"
				alt=""
				width={214}
				height={49}
				className="hidden h-9 w-auto sm:block sm:dark:hidden"
			/>
			<img
				src="/logo-dark.svg"
				alt=""
				width={214}
				height={49}
				className="hidden h-9 w-auto sm:dark:block"
			/>
		</>
	);
}
