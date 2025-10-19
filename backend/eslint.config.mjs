import base from "../eslint.config.mjs";
import globals from "globals";

export default [
    ...base,

    // Override pour le backend Express + _Sequelize + Postgre + Babel
    {
        files: ["**/*.{js,cjs,mjs}"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: {
                ...globals.node, // toutes les globales Node (require, process, etc.)
            },
        },
        rules: {
            "callback-return": "off", // Express utilise souvent next()
            "handle-callback-err": "warn",
            "no-process-exit": "off",
            "no-undef": "error",
            "no-var": "error",
            "consistent-return": "warn",
            "no-shadow": ["warn", { builtinGlobals: false, hoist: "functions" }],
        },
    },

    // Override Babel (pour transpilation / compatibilité)
    {
        files: ["babel.config.cjs"],
        languageOptions: {
            ecmaVersion: "latest",
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
