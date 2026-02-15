import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "semi": ["error", "never"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "jsx-quotes": ["error", "prefer-single"],
      "@typescript-eslint/semi": ["error", "never"],
      "@typescript-eslint/quotes": ["error", "single"],
      "no-unexpected-multiline": "error"
    }
  },
  prettierConfig,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;