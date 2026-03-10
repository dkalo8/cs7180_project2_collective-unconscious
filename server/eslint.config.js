const globals = require("globals");
const pluginJs = require("@eslint/js");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  { 
    languageOptions: { 
      globals: {
        ...globals.node,
        ...globals.jest,
      } 
    } 
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
