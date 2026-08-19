import { expect, test } from "@playwright/test";

// Unknown content slugs answer 200 by design: `cacheComponents` streams a static
// shell before notFound() runs, so the status is already sent. `noindex` is what
// keeps the resulting soft 404 out of search results, which makes it worth a test
// — the failure is silent and only shows up as junk URLs in the index.
const UNKNOWN_CONTENT_PATHS = [
	"/blog/does-not-exist",
	"/newsletter/does-not-exist",
	"/shop/does-not-exist",
];

const robotsDirectives = (page: import("@playwright/test").Page) =>
	page
		.locator('meta[name="robots"]')
		.evaluateAll((tags) => tags.map((t) => t.getAttribute("content") ?? ""));

for (const path of UNKNOWN_CONTENT_PATHS) {
	test(`${path} is marked noindex`, async ({ page }) => {
		await page.goto(path);
		const directives = await robotsDirectives(page);
		expect(directives.length).toBeGreaterThan(0);
		// Every directive has to agree — a stray "index, follow" alongside a
		// "noindex" leaves crawlers resolving a contradiction.
		for (const directive of directives) expect(directive).toContain("noindex");
	});

	test(`${path} renders exactly one navbar`, async ({ page }) => {
		await page.goto(path);
		await expect(page.locator('nav[aria-label="Primary"]:visible')).toHaveCount(
			1,
		);
	});
}

test("a real post stays indexable", async ({ page }) => {
	await page.goto("/blog/get-a-gemini-api-key");
	const directives = await robotsDirectives(page);
	for (const directive of directives)
		expect(directive).not.toContain("noindex");
});

test("the 404 offers a route to every section", async ({ page }) => {
	await page.goto("/blog/does-not-exist");
	await expect(
		page.getByRole("heading", { name: "Page not found" }),
	).toBeVisible();

	const main = page.getByRole("main");
	await expect(
		main.getByRole("link", { name: "Browse the tools" }),
	).toBeVisible();
	for (const section of ["Tools", "Blog", "Shop", "Newsletter"]) {
		await expect(
			main.getByRole("link", { name: section, exact: true }),
		).toBeVisible();
	}
});
