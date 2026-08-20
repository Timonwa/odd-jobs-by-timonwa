// True when running in the browser (not server-side rendering) — guards window/storage access.

export const isBrowser = (): boolean => typeof window !== "undefined";
