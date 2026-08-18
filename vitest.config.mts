import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		// Resolves `@/*` and `@env` from tsconfig.json.
		tsconfigPaths: true,
		alias: {
			// The real package throws outside a React Server Components bundle;
			// tests import server modules directly, so it resolves to an empty stub.
			"server-only": new URL("./test/mocks/server-only.ts", import.meta.url)
				.pathname,
		},
	},
	test: {
		coverage: {
			provider: "v8",
			include: ["src/lib/**"],
			exclude: ["src/lib/**/index.ts", "src/lib/data/**", "src/lib/types/**"],
			reporter: ["text", "html", "lcov"],
		},
		projects: [
			{
				extends: true,
				test: {
					name: "node",
					environment: "node",
					include: ["src/lib/**/*.test.ts"],
					// Hooks and browser-storage utils need jsdom — they belong to `dom`.
					exclude: ["src/lib/hooks/**", "src/lib/utils/storage/**"],
				},
			},
			{
				extends: true,
				test: {
					name: "dom",
					environment: "jsdom",
					setupFiles: ["./vitest.setup.ts"],
					include: [
						"src/**/*.test.tsx",
						"src/lib/hooks/**/*.test.ts",
						"src/lib/utils/storage/**/*.test.ts",
					],
				},
			},
		],
	},
});
