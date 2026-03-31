import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default [
  ...coreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      "backend/**",
      ".next/**",
      "node_modules/**",
      "types/**/*.d.ts",
    ],
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];
