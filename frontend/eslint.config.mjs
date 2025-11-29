import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import globals from "globals";
import base from "../eslint.config.mjs";

export default [
    ...base,

    // Files and folders to ignore (frontend specific)
    {
        ignores: ["**/.next/**", "**/out/**", "next-env.d.ts"],
    },

    // TypeScript configuration for ALL TypeScript files
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
        },
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

    // Configuration for Jest test files
    {
        files: [
            "**/__tests__/**/*.{js,jsx,ts,tsx}",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/*.spec.{js,jsx,ts,tsx}",
            "**/jest.config.ts",
            "**/jest.setup.ts",
        ],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser, // Add DOM globals (document, window, etc.)
                describe: "readonly",
                it: "readonly",
                test: "readonly",
                expect: "readonly",
                jest: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
            },
        },
        rules: {
            // Disable no-console for tests
            "no-console": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
];
