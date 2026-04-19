const js = require("@eslint/js");
const ts = require("typescript-eslint");
const globals = require("globals");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  js.configs.recommended,
  ts.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "warn"
    },
  },
]);

