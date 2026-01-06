import base from "../eslint.config.mjs";
import globals from "globals";

export default [
  ...base,

  // Override for CommonJS files (.cjs) - configs, scripts, build files
  {
    files: ["**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.node,
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      // allow config files to use CommonJS-style globals and patterns
      "no-undef": "off",
      "no-var": "error",
    },
  },

  // Override for backend source (JS / MJS) - Node server code
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Express and Node-specific adjustments
      "callback-return": "off",
      "handle-callback-err": "warn",
      "no-process-exit": "off",
      "no-undef": "error",
      "no-var": "error",
      "prefer-const": "warn",
      "global-require": "warn",
      "consistent-return": "warn",
      "no-shadow": ["warn", { builtinGlobals: false, hoist: "functions" }],

      // Security rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Async/Promise best practices
      "no-return-await": "error",
      "prefer-promise-reject-errors": "warn",
      "require-await": "warn",
      "no-await-in-loop": "warn",
    },
  },

  // Override for Babel config specifically
  {
    files: ["babel.config.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.node,
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
    },
  },
];
