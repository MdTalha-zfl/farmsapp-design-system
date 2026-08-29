import type { StorybookConfig } from "@storybook/react-vite";
import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Resolves the absolute path of a package — needed in monorepos so
 * Storybook doesn't rely on hoisting to find each addon.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: [
    // Component stories are colocated with their component, per
    // decisions/decision-per-component-folder-structure.md.
    "../../../packages/design-system/src/components/**/*.stories.@(ts|tsx|mdx)",
    // Token catalog pages — apps/storybook's own content, not any one
    // component's, so they live here rather than in packages/tokens (which
    // stays React-free).
    "../src/**/*.stories.@(ts|tsx|mdx)",
  ],
  addons: [getAbsolutePath("@storybook/addon-a11y"), getAbsolutePath("@storybook/addon-docs")],
  framework: getAbsolutePath("@storybook/react-vite"),
};

export default config;
