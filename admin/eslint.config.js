import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

const featureBoundaryRules = [
  {
    files: ["src/features/auth/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/dashboard/**", "@/features/placeholder/**"],
              message:
                "Do not import from other features. Use shared code or the feature public API.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/dashboard/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/auth/**", "@/features/placeholder/**"],
              message:
                "Do not import from other features. Use shared code or the feature public API.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/placeholder/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/auth/**", "@/features/dashboard/**"],
              message:
                "Do not import from other features. Use shared code or the feature public API.",
            },
          ],
        },
      ],
    },
  },
];

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/**", "@/app/**"],
              message: "Shared layer must not import from app or features.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/**"],
              message:
                "Import from the feature public API (@/features/<name>) instead of internal paths.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/mocks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/services/**", "@/features/*/hooks/**", "@/features/*/pages/**"],
              message: "Mocks must not import services, hooks, or pages.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/services/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/features/*/hooks/**",
                "@/features/*/pages/**",
                "@/features/*/components/**",
              ],
              message: "Services must not import hooks, pages, or components.",
            },
          ],
        },
      ],
    },
  },
  ...featureBoundaryRules,
  eslintConfigPrettier,
);
