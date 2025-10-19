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
            ".DS_Store",
            "eslint.config.mjs",
        ],
    },

    // Global project configuration
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
            eqeqeq: ["error", "always"],
        },
    },

    // Override for Jest test
    {
        files: ["**/__tests__/**/*.{js,cjs,mjs,jsx,ts,tsx}", "**/*.test.{js,cjs,mjs,jsx}"],
        plugins: {
            jest: jestPlugin,
        },
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
        rules: {
            ...jestPlugin.configs.recommended.rules,
        },
    },
];
