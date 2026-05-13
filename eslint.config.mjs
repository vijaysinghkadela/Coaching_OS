import { defineConfig, globalIgnores } from "eslint/config";
import tsParser from "@typescript-eslint/parser";

// Lightweight ESLint config.
// eslint-config-next is excluded to avoid ~2.5 min plugin loading time on WSL.
// Use `npx next lint` for the full Next.js rule set.

const eslintConfig = defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "warn",
      "prefer-const": "error",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
