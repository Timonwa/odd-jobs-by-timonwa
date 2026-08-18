import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Full jsx-a11y recommended set (broader than next's subset) as the CI a11y gate.
	{ rules: { ...jsxA11y.flatConfigs.recommended.rules } },
	// Must come last: disables rules that conflict with Prettier.
	prettier,
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
