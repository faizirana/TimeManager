import nextPlugin from "@next/eslint-plugin-next";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
    // Base rules for JavaScript
    js.configs.recommended,

    // Recommended rules for TypeScript
    ...tseslint.configs.recommended,

    // Next.js specific rules
    {
        plugins: {
            "@next/next": nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
        },
    },

    // Files and folders to ignore
    {
        ignores: [
            "**/node_modules/**",
            "**/.next/**",
            "**/out/**",
            "**/build/**",
            "**/dist/**",
            "next-env.d.ts",
            ".DS_Store",
            "eslint.config.mjs",
        ],
    },

    // Global project configuration
    {
        files: ["**/*.{js,jsx}"], // ✅ Applies only to your JS/JSX source files
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "warn",
        },
    },

    {
        files: ["**/*.{ts,tsx}"], // ✅ Applies only to your TS/TSX source files
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: "./tsconfig.json",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "warn",
        },
    },

    // Prettier integration (disables rules that conflict with Prettier)
    prettier,
];
