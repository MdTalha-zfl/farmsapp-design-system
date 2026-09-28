import { useState } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { Collapsible } from "./Collapsible";
import { CollapsibleTrigger } from "./CollapsibleTrigger";
import { CollapsibleBody } from "./CollapsibleBody";
import { Box } from "../Box/Box";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";
import { Button } from "../Button/Button";
import { Divider } from "../Divider/Divider";

const constrainWidth: Decorator = (Story) => (
  <div style={{ maxWidth: 400 }}>
    <Story />
  </div>
);

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
  // Every story renders its own trigger/body via a local render function;
  // this arg only satisfies Collapsible's required `children` at the meta
  // level.
  args: {
    children: [],
  },
  decorators: [constrainWidth],
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

interface LineItemProps {
  label: string;
  value: string;
  isDiscount?: boolean;
}

function LineItem({ label, value, isDiscount = false }: LineItemProps) {
  return (
    <Inline gap="4" justifyContent="between">
      <Text variant="body" size="medium" color={isDiscount ? "success" : "secondary"}>
        {label}
      </Text>
      <Text variant="body" size="medium" color={isDiscount ? "success" : "primary"}>
        {value}
      </Text>
    </Inline>
  );
}

/** Uncontrolled, closed on first render. */
export const Basic: Story = {
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleTrigger title="How can I setup Route?" />
      <CollapsibleBody>
        <Text variant="body" color="secondary">
          You can use Route from the Dashboard or using APIs to transfer money to customers. You may also check our
          docs for detailed instructions.
        </Text>
      </CollapsibleBody>
    </Collapsible>
  ),
};

/** `defaultIsOpen` opens it on first render (uncontrolled). */
export const DefaultOpen: Story = {
  render: (args) => (
    <Collapsible {...args} defaultIsOpen>
      <CollapsibleTrigger title="Open by default" />
      <CollapsibleBody>
        <Text variant="body" color="secondary">
          This panel starts expanded because `defaultIsOpen` is true.
        </Text>
      </CollapsibleBody>
    </Collapsible>
  ),
};

/** A disabled Collapsible can't be toggled by the user, but a controlled
 * `isOpen` can still open/close it. */
export const Disabled: Story = {
  render: (args) => (
    <Collapsible {...args} isDisabled defaultIsOpen>
      <CollapsibleTrigger title="This section is locked" />
      <CollapsibleBody>
        <Text variant="body" color="secondary">
          Disabled content, still visible because it opened before being disabled.
        </Text>
      </CollapsibleBody>
    </Collapsible>
  ),
};

/** Controlled via `isOpen` + `onOpenChange`. */
export const Controlled: Story = {
  render: (args) => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <Stack gap="4">
          <Inline gap="2">
            <Button variant="secondary" onClick={() => setIsOpen(true)}>
              Expand
            </Button>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Collapse
            </Button>
          </Inline>
          <Text variant="body" color="secondary">
            isOpen: {String(isOpen)}
          </Text>
          <Collapsible {...args} isOpen={isOpen} onOpenChange={({ isOpen: next }) => setIsOpen(next)}>
            <CollapsibleTrigger title="Controlled from outside" />
            <CollapsibleBody>
              <Text variant="body" color="secondary">
                This panel's open state is driven entirely by the buttons above.
              </Text>
            </CollapsibleBody>
          </Collapsible>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** Real-world usage this component was built for: a cart order summary,
 * collapsed by default with just the total visible, expanding to show the
 * line-item breakdown. `leading`/`trailing` on the trigger hold the total
 * so it stays visible in both states. */
export const OrderSummary: Story = {
  render: (args) => (
    <Box padding="2" borderRadius="lg" backgroundColor="raised">
      <Collapsible {...args} defaultIsOpen>
        <CollapsibleTrigger>
          <Text as="span" variant="body" size="medium" weight="semibold">
            Order Summary
          </Text>
        </CollapsibleTrigger>
        <CollapsibleBody>
          <Stack gap="3">
            <LineItem label="Item Total (3 items)" value="₹234" />
            <LineItem label="Discounts" value="-₹34" isDiscount />
            <LineItem label="Special Discount (Only for you)" value="-₹12" isDiscount />
            <LineItem label="Delivery Charges" value="₹100" />
            <LineItem label="GST" value="₹18" />
            <Divider />
            <Inline gap="4" justifyContent="between">
              <Text variant="body" size="large" weight="semibold">
                Total
              </Text>
              <Text variant="body" size="large" weight="semibold">
                ₹288
              </Text>
            </Inline>
          </Stack>
        </CollapsibleBody>
      </Collapsible>
    </Box>
  ),
};
