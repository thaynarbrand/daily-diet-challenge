import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ['**/*.ts'], languageOptions: { globals: { node: true } } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
]);
