import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import base from '../eslint.config.mjs';

export default [
    ...base,

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
            "**/.next/**",
            "**/out/**",
            "next-env.d.ts",
        ],
    },

    {
        files: ["**/*.{js,jsx}"], // Applies only to your JS/JSX source files
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
        files: ["**/*.{ts,tsx}"], // Applies only to your TS/TSX source files
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
];
