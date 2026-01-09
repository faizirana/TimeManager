import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import globals from "globals";
import base from "../eslint.config.mjs";

export default [
  ...base,

  // Add browser and node globals
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // Files and folders to ignore (frontend specific)
  {
    ignores: [
      "**/.next/**",
      "**/out/**",
      "next-env.d.ts",
      "**/__tests__/**", // Ignore test files - they're checked by Jest/TypeScript
      "**/*.test.{ts,tsx,js,jsx}",
      "**/*.spec.{ts,tsx,js,jsx}",
      "**/jest.config.ts",
      "**/jest.setup.ts",
      "**/jest.polyfills.js",
    ],
  },

  // TypeScript configuration for NON-test TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/jest.config.ts",
      "**/jest.setup.ts",
    ],
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
      globals: {
        ...globals.browser,
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
      globals: {
        React: "readonly", // React is available globally in Next.js
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
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

      // TypeScript specific rules (basic ones that don't require type info)
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      // Note: Rules requiring type information are only enabled for TS files with project config

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

  // Additional TypeScript-specific rules requiring type information (only for non-test TS files)
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/jest.config.ts",
      "**/jest.setup.ts",
    ],
    rules: {
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
    },
  },

  // Configuration for Jest test files - use simplified TypeScript parsing
  {
    files: [
      "**/__tests__/**/*.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/jest.config.ts",
      "**/jest.setup.ts",
    ],
    ...tseslint.configs.base,
    languageOptions: {
      ...tseslint.configs.base.languageOptions,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
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
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Configuration for Jest JS test files
  {
    files: ["**/__tests__/**/*.{js,jsx}", "**/*.test.{js,jsx}", "**/*.spec.{js,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
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
      "no-console": "off",
    },
  },

  // Configuration for jest.polyfills.js (plain JavaScript)
  {
    files: ["**/jest.polyfills.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-undef": "off",
      "consistent-return": "off",
      "no-unused-vars": "off",
    },
  },
];
