import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchIcon, CheckIcon } from "@farmsapp/icons";
import { Tabs } from "./Tabs";
import { TabList } from "./TabList";
import { TabItem } from "./TabItem";
import { TabPanel } from "./TabPanel";
import { Text } from "../Text/Text";
import { Box } from "../Box/Box";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    size: { control: "select", options: ["small", "medium", "large"] },
    variant: { control: "select", options: ["bordered", "borderless", "filled"] },
  },
  args: {
    defaultValue: "account",
    children: (
      <>
        <TabList>
          <TabItem value="account">Account</TabItem>
          <TabItem value="security">Security</TabItem>
          <TabItem value="billing">Billing</TabItem>
        </TabList>
        <TabPanel value="account">
          <Text as="p" padding="2">
            Account settings panel.
          </Text>
        </TabPanel>
        <TabPanel value="security">
          <Text as="p" padding="2">
            Security settings panel.
          </Text>
        </TabPanel>
        <TabPanel value="billing">
          <Text as="p" padding="2">
            Billing settings panel.
          </Text>
        </TabPanel>
      </>
    ),
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default: variant="bordered", size="medium", orientation="horizontal" —
 * arrow keys/Home/End navigate via @floating-ui/react's Composite (no
 * hand-written keyboard code). See
 * decisions/decision-tabs-composite-keyboard-nav.md. */
export const Default: Story = {};

/** A disabled tab is skipped by Composite's roving-tabindex and can't be
 * selected by click or keyboard. */
export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="one">
      <TabList>
        <TabItem value="one">One</TabItem>
        <TabItem value="two" isDisabled>
          Two (disabled)
        </TabItem>
        <TabItem value="three">Three</TabItem>
      </TabList>
      <TabPanel value="one">
        <Text as="p" padding="2">
          Panel one.
        </Text>
      </TabPanel>
      <TabPanel value="two">
        <Text as="p" padding="2">
          Panel two.
        </Text>
      </TabPanel>
      <TabPanel value="three">
        <Text as="p" padding="2">
          Panel three.
        </Text>
      </TabPanel>
    </Tabs>
  ),
};

/** leading icon + label tabs, `variant="filled"` — a pill-shaped animated
 * indicator instead of the bordered underline. */
export const FilledWithIcons: Story = {
  render: () => (
    <Tabs defaultValue="search" variant="filled">
      <TabList>
        <TabItem value="search" leading={SearchIcon}>
          Search
        </TabItem>
        <TabItem value="verify" leading={CheckIcon}>
          Verify
        </TabItem>
      </TabList>
      <TabPanel value="search">
        <Text as="p" padding="2">
          Search panel.
        </Text>
      </TabPanel>
      <TabPanel value="verify">
        <Text as="p" padding="2">
          Verify panel.
        </Text>
      </TabPanel>
    </Tabs>
  ),
};

/** `variant="borderless"` — Blade's own real, shipped-but-undocumented
 * variant (not in Blade's own decisions.md), ported as bordered-minus-
 * divider. See decisions/decision-tabs-borderless-variant.md. */
export const Borderless: Story = {
  render: () => (
    <Tabs defaultValue="one" variant="borderless">
      <TabList>
        <TabItem value="one">One</TabItem>
        <TabItem value="two">Two</TabItem>
        <TabItem value="three">Three</TabItem>
      </TabList>
      <TabPanel value="one">
        <Text as="p" padding="2">
          Panel one.
        </Text>
      </TabPanel>
      <TabPanel value="two">
        <Text as="p" padding="2">
          Panel two.
        </Text>
      </TabPanel>
      <TabPanel value="three">
        <Text as="p" padding="2">
          Panel three.
        </Text>
      </TabPanel>
    </Tabs>
  ),
};

/** `orientation="vertical"` — Up/Down arrows navigate instead of
 * Left/Right; Blade restricts this to web-only (its native Tabs is
 * horizontal-only), which matches this project too since it's web-only
 * today. */
export const Vertical: Story = {
  render: () => (
    <Box display="flex">
      <Tabs defaultValue="one" orientation="vertical">
        <TabList>
          <TabItem value="one">One</TabItem>
          <TabItem value="two">Two</TabItem>
          <TabItem value="three">Three</TabItem>
        </TabList>
        <Box marginLeft="4">
          <TabPanel value="one">
            <Text as="p">Vertical panel one.</Text>
          </TabPanel>
          <TabPanel value="two">
            <Text as="p">Vertical panel two.</Text>
          </TabPanel>
          <TabPanel value="three">
            <Text as="p">Vertical panel three.</Text>
          </TabPanel>
        </Box>
      </Tabs>
    </Box>
  ),
};

/** `isFullWidthTabItem` — tab items stretch to fill the tablist's width
 * evenly instead of sizing to content. */
export const FullWidth: Story = {
  render: () => (
    <Tabs defaultValue="one" isFullWidthTabItem>
      <TabList>
        <TabItem value="one">One</TabItem>
        <TabItem value="two">Two</TabItem>
        <TabItem value="three">Three</TabItem>
      </TabList>
      <TabPanel value="one">
        <Text as="p" padding="2">
          Panel one.
        </Text>
      </TabPanel>
      <TabPanel value="two">
        <Text as="p" padding="2">
          Panel two.
        </Text>
      </TabPanel>
      <TabPanel value="three">
        <Text as="p" padding="2">
          Panel three.
        </Text>
      </TabPanel>
    </Tabs>
  ),
};

/** `isLazy` — an inactive panel's children don't mount until first
 * selected (then stay mounted, matching Blade's real behavior — not
 * unmounted again on deselect). Real perf value for this project's stated
 * low-end-device audience. See decisions/decision-tabs-lazy-panels.md. */
export const LazyPanels: Story = {
  render: () => {
    function LazyExample() {
      const [mounted, setMounted] = useState<string[]>(["lazy-a"]);
      return (
        <Box display="flex" flexDirection="column" gap="2">
          <Text as="p" size="small" color="secondary">
            Mounted so far: {mounted.join(", ")}
          </Text>
          <Tabs
            defaultValue="lazy-a"
            isLazy
            onChange={(value) => setMounted((prev) => (prev.includes(value) ? prev : [...prev, value]))}
          >
            <TabList>
              <TabItem value="lazy-a">Lazy A</TabItem>
              <TabItem value="lazy-b">Lazy B</TabItem>
            </TabList>
            <TabPanel value="lazy-a">
              <Text as="p" padding="2">
                Lazy A mounted.
              </Text>
            </TabPanel>
            <TabPanel value="lazy-b">
              <Text as="p" padding="2">
                Lazy B mounted.
              </Text>
            </TabPanel>
          </Tabs>
        </Box>
      );
    }
    return <LazyExample />;
  },
};

/** `href` on a TabItem renders a real `<a>` (link-as-tab) instead of a
 * `<button>`, still fully keyboard-navigable via Composite's roving
 * tabindex. Included for future router-integration readiness even without
 * a router wired up yet. See decisions/decision-tabs-link-as-tab.md. */
export const LinkAsTab: Story = {
  render: () => (
    <Tabs defaultValue="ext">
      <TabList>
        <TabItem value="ext" href="#tabs--link-as-tab">
          Link tab
        </TabItem>
        <TabItem value="normal">Normal tab</TabItem>
      </TabList>
      <TabPanel value="ext">
        <Text as="p" padding="2">
          Reached via link-as-tab.
        </Text>
      </TabPanel>
      <TabPanel value="normal">
        <Text as="p" padding="2">
          Normal panel.
        </Text>
      </TabPanel>
    </Tabs>
  ),
};

/** Real controlled `value`/`onChange` — an external control can drive
 * selection. */
export const Controlled: Story = {
  render: () => {
    function ControlledExample() {
      const [value, setValue] = useState("one");
      return (
        <Box display="flex" flexDirection="column" gap="2">
          <Tabs value={value} onChange={setValue}>
            <TabList>
              <TabItem value="one">One</TabItem>
              <TabItem value="two">Two</TabItem>
              <TabItem value="three">Three</TabItem>
            </TabList>
            <TabPanel value="one">
              <Text as="p" padding="2">
                Panel one.
              </Text>
            </TabPanel>
            <TabPanel value="two">
              <Text as="p" padding="2">
                Panel two.
              </Text>
            </TabPanel>
            <TabPanel value="three">
              <Text as="p" padding="2">
                Panel three.
              </Text>
            </TabPanel>
          </Tabs>
          <Box display="flex" gap="2">
            <button onClick={() => setValue("one")}>Select One</button>
            <button onClick={() => setValue("two")}>Select Two</button>
            <button onClick={() => setValue("three")}>Select Three</button>
          </Box>
        </Box>
      );
    }
    return <ControlledExample />;
  },
};
