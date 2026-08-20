import { defineConfig, devices } from "@playwright/test";

// Runs against a production server (`pnpm build` first): the security headers,
// redirects, and hosted-AI refusal only behave like production in a built app.
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: "pnpm start",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
});
