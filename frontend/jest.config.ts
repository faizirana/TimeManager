import type { Config } from "jest";
import nextJest from "next/jest.js";

/**
 * Jest Configuration for Next.js
 *
 * This configuration allows testing a Next.js application with:
 * - TypeScript support
 * - Path aliases support (@/*)
 * - CSS modules support
 * - jsdom environment (simulates a browser)
 */

// Create a Jest config loader configured for Next.js
const createJestConfig = nextJest({
  // Path to the Next.js app to load next.config.js and .env files
  dir: "./",
});

// Custom Jest configuration
const config: Config = {
  // Code coverage
  coverageProvider: "v8",

  // Coverage directory
  coverageDirectory: "coverage",

  // Patterns to ignore certain files
  coveragePathIgnorePatterns: ["/node_modules/", "/.next/", "/coverage/"],

  // Minimum coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Test environment (jsdom simulates a browser)
  testEnvironment: "jsdom",

  // Polyfills to run before tests
  setupFiles: ["<rootDir>/jest.polyfills.js"],

  // Setup files to run after the test environment is ready
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Module mapping (to handle imports of styles, images, etc.)
  moduleNameMapper: {
    // Handle CSS Modules
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Handle standard CSS
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",

    // Handle images and other assets
    "^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$": "<rootDir>/__mocks__/fileMock.js",

    // Path alias (@/* → ./*)
    "^@/(.*)$": "<rootDir>/$1",
  },

  // File extensions to consider
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Patterns to find test files
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  // Ignore certain folders
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  // Transform node_modules that are ESM only (like jose)
  transformIgnorePatterns: ["/node_modules/(?!jose/)"],

  // File transformation (TypeScript, etc.)
  transform: {
    "^.+\\.(ts|tsx)$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
  },

  // Coverage collection
  collectCoverageFrom: [
    "!app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/jest.config.ts",
    "!**/jest.setup.ts",
    "!**/jest.polyfills.js",
  ],
};

export default createJestConfig(config);
