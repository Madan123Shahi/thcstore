import js from "@eslint/js";

export default [
  js.configs.recommended,

  // ── All server files ──────────────────────
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // ✅ Node.js globals
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        global: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      "no-undef": "error",
    },
    ignores: ["node_modules/**", "logs/**", "coverage/**", "dist/**"],
  },

  // ── Test files only — adds Jest globals ──
  {
    files: [
      "**/*.test.js",
      "**/*.spec.js",
      "**/jest.setup.js",
      "**/tests/**/*.js",
      "**/helpers/**/*.js",
    ],
    languageOptions: {
      globals: {
        // ✅ Jest globals
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
        // ✅ Node globals in test files
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
      },
    },
  },
];
