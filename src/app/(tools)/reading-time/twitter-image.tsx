/** Twitter card image for the Reading Time Estimator — re-exports the OG image. */
export { alt, contentType, default, size } from "./opengraph-image";
// Edge runtime: a deliberate choice for image generation, not a Next.js
// requirement (these routes build fine on Node). Content-backed OG routes must
// NOT copy it — they read MDX with node:fs, which the edge runtime lacks.
export const runtime = "edge";
