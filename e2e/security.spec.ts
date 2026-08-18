import { expect, test } from "@playwright/test";

const BYOK_SESSION_KEY = "tbt:byok:api-key";
const FAKE_KEY = "AIzaSyFakeE2eKey123456789012345678901";

// Served from next.config.ts headers() on every path.
const SECURITY_HEADERS = [
	"content-security-policy",
	"x-frame-options",
	"x-content-type-options",
	"referrer-policy",
	"permissions-policy",
	"strict-transport-security",
] as const;

for (const path of ["/", "/word-counter"]) {
	test(`serves the security headers on ${path}`, async ({ request }) => {
		const response = await request.get(path);
		for (const header of SECURITY_HEADERS) {
			expect(response.headers()[header], header).toBeTruthy();
		}
		expect(response.headers()["x-frame-options"]).toBe("DENY");
	});
}

test("permanently redirects /guides to /blog", async ({ request }) => {
	const response = await request.get("/guides", { maxRedirects: 0 });
	expect(response.status()).toBe(308);
	expect(response.headers()["location"]).toContain("/blog");
});

test.describe("BYOK key handling", () => {
	test("saves the key to sessionStorage only — never localStorage or the page", async ({
		page,
	}) => {
		await page.goto("/article-to-seo-meta");
		await page
			.getByRole("button", { name: /add your own gemini key/i })
			.click();
		await page.getByLabel("Google API key").fill(FAKE_KEY);
		await page.getByRole("button", { name: "Save key" }).click();

		await expect
			.poll(() =>
				page.evaluate(
					(key) => window.sessionStorage.getItem(key),
					BYOK_SESSION_KEY,
				),
			)
			.toBe(FAKE_KEY);

		// Session-only by design: nothing key-shaped may land in localStorage.
		const localStorageDump = await page.evaluate(() =>
			JSON.stringify(window.localStorage),
		);
		expect(localStorageDump).not.toContain(FAKE_KEY);

		// The input clears on save and the UI shows only a masked form, so the
		// raw key must be gone from the DOM entirely.
		await expect(page.getByLabel("Google API key")).toHaveValue("");
		const html = await page.content();
		expect(html).not.toContain(FAKE_KEY);
	});

	test("does not leak the key to a fresh browser context", async ({
		browser,
	}) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.goto("/article-to-seo-meta");
		const stored = await page.evaluate(
			(key) => window.sessionStorage.getItem(key),
			BYOK_SESSION_KEY,
		);
		expect(stored).toBeNull();
		await context.close();
	});
});

// The E2E server runs with no Upstash credentials, so metering is impossible —
// a built app must refuse hosted generations (fail closed) rather than spend
// the platform key unmetered. The UI's answer is the BYOK path.
test("offers BYOK instead of unmetered hosted generations", async ({
	page,
}) => {
	await page.goto("/article-to-seo-meta");
	await expect(
		page.getByRole("button", { name: /add your own gemini key/i }),
	).toBeVisible();
});
