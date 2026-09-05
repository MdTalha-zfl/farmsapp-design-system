import storybook from "eslint-plugin-storybook";
import config from "@farmsapp/eslint-config/react";

export default [
  ...config,
  ...storybook.configs["flat/recommended"],
  { ignores: ["storybook-static/**"] },
];
