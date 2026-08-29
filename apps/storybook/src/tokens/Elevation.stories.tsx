import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@farmsapp/design-system";
import { readToken } from "./readToken";

const meta = {
  title: "Tokens/Elevation",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Named by use (card/dialog), not raw shadow depth — resolves to the
 * theme-appropriate shadow.* value automatically via the tokens.theme layer,
 * so switching the Theme toolbar swaps these for their dark-mode companions. */
export const Elevation: Story = {
  render: () => (
    <Box display="flex" gap="8" flexWrap="wrap" padding="8" backgroundColor="sunken">
      {(["card", "dialog"] as const).map((step) => {
        const varName = `--ds-elevation-${step}`;
        return (
          <Box key={step} display="flex" flexDirection="column" alignItems="center" gap="2">
            <Box
              backgroundColor="raised"
              borderRadius="md"
              unsafeStyle={{ width: 160, height: 100, boxShadow: `var(${varName})` }}
            />
            <Box unsafeStyle={{ fontFamily: "ui-monospace, monospace", fontSize: "0.75rem" }}>
              elevation.{step}
            </Box>
            <Box
              unsafeStyle={{
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.625rem",
                opacity: 0.7,
                maxWidth: 220,
                textAlign: "center",
              }}
            >
              {readToken(varName)}
            </Box>
          </Box>
        );
      })}
    </Box>
  ),
};
