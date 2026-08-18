import { expect, test } from "@playwright/test";

// Render smoke: every key section serves 200 with a rendered, non-empty h1.
// The exact hero copy is editorial and changes freely, so it isn't pinned here.
const PAGES = [
	"/",
	"/tools",
	"/categories/writing",
	"/blog",
	"/newsletter",
	"/shop",
];

for (const path of PAGES) {
	test(`renders ${path}`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.status()).toBe(200);
		const heading = page.getByRole("heading", { level: 1 });
		await expect(heading).toBeVisible();
		await expect(heading).not.toBeEmpty();
	});
}

test("word counter counts as you type", async ({ page }) => {
	await page.goto("/word-counter");
	await page.getByRole("textbox").first().fill("one two three four five");
	// The stat card renders its label and value as one text node.
	await expect(page.getByText(/^Words5$/)).toBeVisible();
});
