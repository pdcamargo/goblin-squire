/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/library.js"],
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["*.json"],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    // forbid any
    "@typescript-eslint/no-explicit-any": "error",
  },
};
