/** Coerces free text into a valid PascalCase React component name — strips non-alphanumerics, prefixes `Icon` when it would otherwise start with a digit, and returns "" for input with nothing usable in it. */
export function sanitizeComponentName(raw: string): string {
	const cleaned = raw.replace(/[^a-zA-Z0-9]/g, "");
	if (!cleaned) return "";
	const withLetter = /^[a-zA-Z]/.test(cleaned) ? cleaned : `Icon${cleaned}`;
	return withLetter.charAt(0).toUpperCase() + withLetter.slice(1);
}
