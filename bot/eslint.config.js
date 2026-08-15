const nodeGlobals = {
  console: "readonly",
  process: "readonly",
  URL: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly"
};

export default [
  {
    files: ["src/**/*.js", "tests/**/*.js", "scripts/**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: nodeGlobals
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "prefer-const": "warn",
      "eqeqeq": ["error", "always"],
      "no-var": "error"
    }
  }
];
