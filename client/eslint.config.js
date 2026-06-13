import reactPlugin from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    plugins: {
      "@eslint-react": reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      "@eslint-react/no-missing-key": "warn",
      "@eslint-react/no-duplicate-key": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
