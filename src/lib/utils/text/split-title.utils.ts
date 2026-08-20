// Client-safe — splits a content title into lead + accent for the hero gradient.
// Shared by blog posts, newsletter issues, and shop products.

export function splitTitle(input: { title: string; titleAccent: string }): {
	lead: string;
	accent: string;
} {
	const { title, titleAccent } = input;
	if (titleAccent && title.endsWith(titleAccent)) {
		return {
			lead: title.slice(0, title.length - titleAccent.length),
			accent: titleAccent,
		};
	}
	return { lead: "", accent: title };
}
