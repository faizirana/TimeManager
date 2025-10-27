import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import base from "../eslint.config.mjs";

export default [
    ...base,

    // TypeScript ESLint recommended rules
    ...tseslint.configs.recommended,

    // Files and folders to ignore (frontend specific)
    {
        ignores: ["**/.next/**", "**/out/**", "next-env.d.ts"],
    },

    // Next.js specific configuration
    {
        plugins: {
            "@next/next": nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
        },
    },

    // Configuration for all JavaScript/TypeScript files
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            // Console - Error in frontend (should use proper logging)
            "no-console": ["error", { allow: ["warn", "error"] }],

            // Unused vars with better pattern
            "no-unused-vars": "off", // Disabled for TypeScript
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],

            // TypeScript specific rules
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/prefer-nullish-coalescing": "warn",
            "@typescript-eslint/prefer-optional-chain": "warn",

            // React best practices (if you install eslint-plugin-react)
            // Uncomment when plugins are installed:
            // "react/prop-types": "off", // TypeScript handles this
            // "react/react-in-jsx-scope": "off", // Not needed in Next.js
            // "react-hooks/rules-of-hooks": "error",
            // "react-hooks/exhaustive-deps": "warn",

            // Accessibility (if you install eslint-plugin-jsx-a11y)
            // Uncomment when plugin is installed:
            // "jsx-a11y/alt-text": "warn",
            // "jsx-a11y/anchor-is-valid": "warn",
        },
    },
];
