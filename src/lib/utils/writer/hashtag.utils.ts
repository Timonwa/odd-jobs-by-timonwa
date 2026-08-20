/** Strips leading #, trims whitespace, drops invalid characters; returns "" for unusable input so callers can filter. */
export const normalizeHashtag = (raw: string): string => {
	const stripped = raw.trim().replace(/^#+/, "").trim();
	if (!stripped) return "";
	// Allow letters, digits, underscores, hyphens. Drop everything else.
	return stripped.replace(/[^\p{L}\p{N}_-]/gu, "").slice(0, 40);
};
