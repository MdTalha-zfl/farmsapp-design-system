import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BottomBar } from "./BottomBar";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Heading } from "../Heading/Heading";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";

const meta = {
  title: "Components/BottomBar",
  component: BottomBar,
  tags: ["autodocs"],
  // The bar is `position: fixed`; rendering each docs story in its own iframe
  // stops several bars stacking at the bottom of the one docs page.
  parameters: { layout: "fullscreen", docs: { story: { inline: false, iframeHeight: 420 } } },
  args: { children: null },
} satisfies Meta<typeof BottomBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The bar is fixed, so it takes no space in the page — the content behind it
 * needs bottom padding, or its last item is hidden under the bar. */
function Screen({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", padding: "var(--ds-space-4)", paddingBottom: 120 }}>
      <Stack gap="2">
        <Heading level="2" variant="heading-md">
          {title}
        </Heading>
        {children}
      </Stack>
    </div>
  );
}

/** Two actions: the secondary and primary buttons split the bar equally
 * (`isFullWidth` buttons share the row). */
export const TwoActions: Story = {
  render: () => (
    <Screen title="Review order">
      <Text variant="body" color="secondary">
        Check your items before you pay.
      </Text>
      <BottomBar accessibilityLabel="Order actions">
        <Button variant="secondary" isFullWidth>
          Cancel
        </Button>
        <Button isFullWidth>Continue</Button>
      </BottomBar>
    </Screen>
  ),
};

/** One action: a single large button fills the bar. */
export const SingleAction: Story = {
  render: () => (
    <Screen title="Checkout">
      <Text variant="body" color="secondary">
        One clear next step.
      </Text>
      <BottomBar accessibilityLabel="Payment actions">
        <Button isFullWidth size="large">
          Pay Now
        </Button>
      </BottomBar>
    </Screen>
  ),
};

/** Scrolling page: the bar stays put while the content scrolls behind it. The
 * last paragraph is still reachable because the screen reserves bottom
 * padding. */
export const OverScrollingContent: Story = {
  render: () => (
    <Screen title="Terms">
      {Array.from({ length: 30 }, (_, i) => (
        <Text key={i} variant="body">
          Paragraph {i + 1} — scroll the page: the bar stays fixed at the bottom.
        </Text>
      ))}
      <BottomBar accessibilityLabel="Terms actions">
        <Button variant="secondary" isFullWidth>
          Decline
        </Button>
        <Button isFullWidth>Accept</Button>
      </BottomBar>
    </Screen>
  ),
};

/** A primary action that depends on the screen's state: disabled until the box
 * is ticked, then briefly loading after it is pressed. */
export const DisabledAndLoadingAction: Story = {
  render: () => {
    function Example() {
      const [agreed, setAgreed] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      return (
        <Screen title="Confirm">
          <Checkbox isChecked={agreed} onChange={({ isChecked }) => setAgreed(isChecked)}>
            I agree to the terms
          </Checkbox>
          <BottomBar accessibilityLabel="Confirmation actions">
            <Button variant="secondary" isFullWidth>
              Back
            </Button>
            <Button
              isFullWidth
              isDisabled={!agreed}
              isLoading={isLoading}
              onClick={() => {
                setIsLoading(true);
                window.setTimeout(() => setIsLoading(false), 1500);
              }}
            >
              Confirm
            </Button>
          </BottomBar>
        </Screen>
      );
    }
    return <Example />;
  },
};

/** `zIndex` overrides the default stacking (the `sticky` tier, 100, shared with
 * BottomNav). Here a fixed banner sits at 150: by default it covers the bar;
 * raising the bar to 200 puts it back on top. */
export const ZIndexOverride: Story = {
  render: () => {
    function Example() {
      const [raised, setRaised] = useState(false);
      return (
        <Screen title="Stacking">
          <Button variant="tertiary" onClick={() => setRaised((value) => !value)}>
            {raised ? "Lower the bar (default z-index)" : "Raise the bar (zIndex 200)"}
          </Button>
          <div
            style={{
              position: "fixed",
              left: 0,
              bottom: 0,
              width: "100%",
              height: 90,
              zIndex: 150,
              background: "var(--ds-color-surface-sunken)",
              opacity: 0.95,
            }}
          >
            <Text variant="body" padding="2">
              Fixed banner (z-index 150)
            </Text>
          </div>
          <BottomBar accessibilityLabel="Stacking demo" {...(raised ? { zIndex: 200 } : {})}>
            <Button isFullWidth>Action</Button>
          </BottomBar>
        </Screen>
      );
    }
    return <Example />;
  },
};
