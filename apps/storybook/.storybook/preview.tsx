import type { Preview, Decorator } from "@storybook/react-vite";
import { ThemeProvider } from "@farmsapp/themes";
import "@farmsapp/tokens/css";
import "@farmsapp/design-system/css";
import "@farmsapp/icons/css";

/**
 * Theme/brand switching mirrors how ThemeProvider actually works in a real
 * consuming app (System Blueprint §06): light/dark and brand overrides are
 * data-theme / data-brand attributes on <html>, read by CSS (per
 * project memory "TS tokens vs CSS vars" — only CSS custom properties react
 * to these, so this toolbar exercises the real mechanism, not a mock of it).
 *
 * ThemeProvider itself only reads those attributes once, at mount
 * (ThemeProvider.tsx's readInitialTheme/readInitialBrand) — so switching the
 * toolbar mid-session remounts it via the `key` below, rather than trying to
 * push new values into its internal state from outside.
 */
const withTheme: Decorator = (Story, context) => {
  const { theme, brand } = context.globals;
  document.documentElement.setAttribute("data-theme", theme);
  if (brand && brand !== "default") {
    document.documentElement.setAttribute("data-brand", brand);
  } else {
    document.documentElement.removeAttribute("data-brand");
  }

  return (
    <ThemeProvider key={`${theme}-${brand}`}>
      <Story />
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
  globalTypes: {
    theme: {
      description: "Light/dark theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
    brand: {
      description: "Brand override",
      toolbar: {
        title: "Brand",
        icon: "paintbrush",
        items: [
          { value: "default", title: "Default" },
          { value: "pilot", title: "Pilot" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
    brand: "default",
  },
  decorators: [withTheme],
};

export default preview;
