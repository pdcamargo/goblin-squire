/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/react-internal.js"],
  parser: "@typescript-eslint/parser",
  ignorePatterns: ["*.json"],
  parserOptions: {
    project: "./tsconfig.lint.json",
  },
};
