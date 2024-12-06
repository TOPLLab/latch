import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import stylisticJs from '@stylistic/eslint-plugin-js'


/** @type {import('eslint').Linter.Config[]} */
export default [
  { plugins: {
      '@stylistic/js': stylisticJs
    }, rules: {
      '@stylistic/js/indent': ['error', 4],
    }
  },
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
