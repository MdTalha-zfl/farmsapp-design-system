import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text";
import { Stack } from "../Stack/Stack";

const meta = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["body", "caption"] },
    size: { control: "select", options: [undefined, "xsmall", "small", "medium", "large", "xlarge", "2xlarge"] },
    weight: { control: "select", options: [undefined, "regular", "medium", "semibold"] },
    color: {
      control: "select",
      options: [undefined, "primary", "secondary", "disabled", "inverse", "danger", "warning", "success"],
    },
    letterSpacing: { control: "select", options: ["tight", "normal", "wide"] },
    lang: { control: "select", options: [undefined, "en", "hi"] },
    textAlign: { control: "select", options: [undefined, "left", "center", "right", "justify"] },
    textTransform: { control: "select", options: [undefined, "none", "capitalize", "uppercase", "lowercase"] },
    textDecorationLine: { control: "select", options: [undefined, "none", "underline", "line-through", "dotted"] },
  },
  args: {
    variant: "body",
    children: "The quick brown fox jumps over the lazy dog.",
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `body`'s five sizes — caption is a fixed xsmall/small pair, shown in the
 * `Caption` story instead (see decisions/decision-text-size-scoped-to-variant.md). */
export const BodySizes: Story = {
  render: () => (
    <Stack gap="2">
      {(["xsmall", "small", "medium", "large", "xlarge", "2xlarge"] as const).map((size) => (
        <Text key={size} variant="body" size={size}>
          {size} — The quick brown fox jumps over the lazy dog.
        </Text>
      ))}
    </Stack>
  ),
};

export const Caption: Story = {
  args: { variant: "caption", children: "Caption text" },
};

/** Devanagari script exercises the `lang="hi"` letter-spacing guard —
 * see decisions/decision-devanagari-letter-spacing-guard.md. */
export const DevanagariScript: Story = {
  args: { lang: "hi", children: "यह एक उदाहरण वाक्य है।" },
};
