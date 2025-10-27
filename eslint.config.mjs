import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import jestPlugin from "eslint-plugin-jest";

export default [
    js.configs.recommended,

    // Prettier integration (disables rules that conflict with Prettier)
    prettier,

    // Files and folders to ignore
    {
        ignores: [
            "**/node_modules/**",
            "**/build/**",
            "**/dist/**",
            "**/.next/**",
            "**/out/**",
            "**/coverage/**",
            ".DS_Store",
            "*.config.{js,mjs,cjs}",
        ],
    },

    // Global project configuration
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
        },
        rules: {
            // Variables
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
            "no-undef": "error",
            "no-var": "error",
            "prefer-const": "warn",

            // Best practices
            eqeqeq: ["error", "always"],
            "no-console": "off", // Backend needs console, frontend will override
            "consistent-return": "warn",
            "no-shadow": ["warn", { builtinGlobals: false }],

            // Security
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-new-func": "error",
            "no-return-await": "warn",

            // Error handling
            "no-throw-literal": "error",
            "prefer-promise-reject-errors": "error",

            // Modern JavaScript
            "prefer-arrow-callback": "warn",
            "prefer-template": "warn",
            "object-shorthand": "warn",
        },
    },

    // Override for CommonJS files (.cjs)
    {
        files: ["**/*.cjs"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                ...globals.node,
                module: "readonly",
                require: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
            },
        },
    },

    // Override for Jest tests
    {
        files: [
            "**/__tests__/**/*.{js,cjs,mjs,jsx,ts,tsx}",
            "**/*.test.{js,cjs,mjs,jsx,ts,tsx}",
            "**/*.spec.{js,cjs,mjs,jsx,ts,tsx}",
        ],
        plugins: {
            jest: jestPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.node,
            },
        },
        rules: {
            ...jestPlugin.configs.recommended.rules,
            "no-console": "off", // Allow console in tests
        },
    },
];
