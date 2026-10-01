import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Type-aware rules for application code.
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommendedTypeChecked, tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
    },
  },

  // Strict accessibility rules. eslint-config-next already registers the jsx-a11y plugin,
  // so only the rule set is applied here (registering a second copy of the plugin fails).
  {
    files: ["**/*.{jsx,tsx}"],
    rules: jsxA11y.flatConfigs.strict.rules,
  },

  // Design tokens only: no inline styles in components. The OG image is the one exception,
  // because it renders outside the browser (Satori) and cannot read CSS custom properties.
  {
    files: ["src/**/*.tsx"],
    ignores: ["src/app/opengraph-image.tsx", "src/app/twitter-image.tsx"],
    rules: {
      "react/forbid-dom-props": ["error", { forbid: ["style"] }],
      "react/forbid-component-props": ["error", { forbid: ["style"] }],
    },
  },

  // Plain Node scripts are not part of the TypeScript project.
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
