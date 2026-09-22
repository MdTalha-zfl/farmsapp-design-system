import { useState } from "react";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircleIcon, CheckIcon, EyeIcon, SearchIcon } from "@farmsapp/icons";
import { Accordion } from "./Accordion";
import { AccordionItem } from "./AccordionItem";
import { AccordionItemHeader } from "./AccordionItemHeader";
import { AccordionItemBody } from "./AccordionItemBody";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Box } from "../Box/Box";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";
import { TextInput } from "../Input/TextInput/TextInput";

const constrainWidth: Decorator = (Story) => (
  <div style={{ maxWidth: 480 }}>
    <Story />
  </div>
);

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  // Every story renders its own items via a local render function; this
  // arg only satisfies Accordion's required `children` at the meta level.
  args: {
    children: [],
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["transparent", "filled"] },
    size: { control: "inline-radio", options: ["large", "medium"] },
  },
  decorators: [constrainWidth],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const ROUTE_TEXT =
  "You can use Route from the Dashboard or using APIs to transfer money to customers. You may also check our docs for detailed instructions.";
const GENERIC_TEXT =
  "You may also check our docs for detailed instructions. Please use the search functionality to ask your queries.";

/** Uncontrolled, transparent variant, nothing open initially. */
export const Basic: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem>
        <AccordionItemHeader title="How can I setup Route?" />
        <AccordionItemBody>{ROUTE_TEXT}</AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader title="How can I setup QR Codes?" />
        <AccordionItemBody>{GENERIC_TEXT}</AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader title="How can I setup Subscriptions?" />
        <AccordionItemBody>{GENERIC_TEXT}</AccordionItemBody>
      </AccordionItem>
    </Accordion>
  ),
};

/** `defaultExpandedIndex` opens an item on first render (uncontrolled). */
export const DefaultExpanded: Story = {
  render: (args) => (
    <Accordion {...args} defaultExpandedIndex={0}>
      <AccordionItem>
        <AccordionItemHeader title="Open by default" />
        <AccordionItemBody>{ROUTE_TEXT}</AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader title="Closed" />
        <AccordionItemBody>{GENERIC_TEXT}</AccordionItemBody>
      </AccordionItem>
    </Accordion>
  ),
};

/** Filled variant, medium size — the rounded card clips the first/last
 * header's hover background to its corners. */
export const FilledMedium: Story = {
  args: { variant: "filled", size: "medium" },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem>
        <AccordionItemHeader title="Filled variant, medium size" subtitle="With a subtitle" />
        <AccordionItemBody>This accordion uses the filled variant with medium size.</AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader title="Another filled item" />
        <AccordionItemBody>More content for the filled variant.</AccordionItemBody>
      </AccordionItem>
    </Accordion>
  ),
};

/** `showNumberPrefix` prepends 1-based numbers. Can't be combined with
 * `leading` on the same header. */
export const NumberPrefix: Story = {
  args: { showNumberPrefix: true },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem>
        <AccordionItemHeader title="First item with numbered prefix" />
        <AccordionItemBody>Content for the first item.</AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader title="Second item with numbered prefix" />
        <AccordionItemBody>Content for the second item.</AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader title="Third item with numbered prefix" />
        <AccordionItemBody>Content for the third item.</AccordionItemBody>
      </AccordionItem>
    </Accordion>
  ),
};

/** `leading`, `subtitle`, `titleSuffix`, `trailing`, and a disabled item.
 * The trailing Button is a sibling of the toggle button (not nested in it),
 * so clicking it does not toggle the item and needs no stopPropagation. */
export const RichHeader: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem>
        <AccordionItemHeader
          leading={<SearchIcon size="medium" />}
          title="How can I setup Route?"
          subtitle="Subtitle for route setup"
          titleSuffix={
            <Badge color="success" size="small">
              New
            </Badge>
          }
          trailing={
            <Button variant="tertiary" size="small" onClick={() => alert("Apply clicked")}>
              Apply
            </Button>
          }
        />
        <AccordionItemBody>{ROUTE_TEXT}</AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader leading={<EyeIcon size="medium" />} title="How can I setup QR Codes?" />
        <AccordionItemBody>{GENERIC_TEXT}</AccordionItemBody>
      </AccordionItem>
      <AccordionItem isDisabled>
        <AccordionItemHeader
          leading={<CheckIcon size="medium" color="disabled" />}
          title="How can I setup Subscriptions?"
          subtitle="This item is disabled"
        />
        <AccordionItemBody>This item is disabled and cannot be expanded.</AccordionItemBody>
      </AccordionItem>
    </Accordion>
  ),
};

/** Controlled via `expandedIndex` + `onExpandChange`; `-1` collapses all. */
export const Controlled: Story = {
  render: (args) => {
    function Example() {
      const [expandedIndex, setExpandedIndex] = useState(-1);
      return (
        <Stack gap="4">
          <Inline gap="2">
            <Button variant="secondary" onClick={() => setExpandedIndex(0)}>
              Expand first
            </Button>
            <Button variant="secondary" onClick={() => setExpandedIndex(1)}>
              Expand second
            </Button>
            <Button variant="secondary" onClick={() => setExpandedIndex(-1)}>
              Collapse all
            </Button>
          </Inline>
          <Text variant="body" color="secondary">
            expandedIndex: {expandedIndex}
          </Text>
          <Accordion
            {...args}
            expandedIndex={expandedIndex}
            onExpandChange={({ expandedIndex: next }) => setExpandedIndex(next)}
          >
            <AccordionItem>
              <AccordionItemHeader title="Controlled item 1" subtitle="Driven by external state" />
              <AccordionItemBody>Content for controlled item 1.</AccordionItemBody>
            </AccordionItem>
            <AccordionItem>
              <AccordionItemHeader title="Controlled item 2" subtitle="Also driven by external state" />
              <AccordionItemBody>Content for controlled item 2.</AccordionItemBody>
            </AccordionItem>
          </Accordion>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** Custom header children replace title/subtitle; body accepts any node. */
export const CustomContent: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem>
        <AccordionItemHeader>
          <Stack gap="1">
            <Text as="span" variant="body" color="secondary">
              #8218851
            </Text>
            <Text as="span" variant="body" size="large" weight="semibold">
              Transactions and settlement related
            </Text>
            <Inline gap="2" alignItems="center">
              <Badge color="warning" size="small">
                In progress
              </Badge>
              <AlertCircleIcon size="small" color="secondary" />
              <Text as="span" variant="body" size="small" color="secondary">
                Merchant Risk
              </Text>
            </Inline>
          </Stack>
        </AccordionItemHeader>
        <AccordionItemBody>
          <TextInput id="accordion-custom-info" label="Additional information" placeholder="Enter details here" />
          <Box>
            <Button>Submit</Button>
          </Box>
        </AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader title="Item with interactive body content" />
        <AccordionItemBody>
          <Text variant="body" color="secondary">
            Body content can be any node, not just a string.
          </Text>
        </AccordionItemBody>
      </AccordionItem>
    </Accordion>
  ),
};

/** Real-world: payment method selection, filled, first item open. */
export const PaymentMethods: Story = {
  args: { variant: "filled" },
  render: (args) => (
    <Accordion {...args} defaultExpandedIndex={0}>
      <AccordionItem>
        <AccordionItemHeader title="UPI payment" subtitle="Pay directly from your bank account" />
        <AccordionItemBody>
          <TextInput id="accordion-upi-id" label="UPI ID" placeholder="username@upi" />
          <Button isFullWidth>Pay now</Button>
        </AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader
          title="Credit card"
          subtitle="Secure card payment"
          titleSuffix={
            <Badge color="success" size="small">
              No extra charge
            </Badge>
          }
        />
        <AccordionItemBody>
          <TextInput id="accordion-card-number" label="Card number" placeholder="1234 5678 9012 3456" />
          <Inline gap="4">
            <TextInput id="accordion-card-expiry" label="Expiry" placeholder="MM/YY" />
            <TextInput id="accordion-card-cvv" label="CVV" placeholder="123" />
          </Inline>
          <Button isFullWidth>Pay now</Button>
        </AccordionItemBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionItemHeader
          title="Net banking"
          subtitle="Pay using your bank account"
          titleSuffix={
            <Badge color="success" size="small">
              5% cashback
            </Badge>
          }
        />
        <AccordionItemBody>
          <TextInput id="accordion-net-bank" label="Select bank" placeholder="Choose your bank" />
          <Button isFullWidth>Continue</Button>
        </AccordionItemBody>
      </AccordionItem>
    </Accordion>
  ),
};
