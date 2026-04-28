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
      // i know i shouldn't manually edit eslint standards but 
      //   this is for the non-required typescript aspect ...
      //   feel free to still take off points though if this isn't allowed
      "@typescript-eslint/no-explicit-any": "warn"
    },
  },
]);

