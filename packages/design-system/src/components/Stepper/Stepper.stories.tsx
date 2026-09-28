import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper } from "./Stepper";
import { StepperItem } from "./StepperItem";
import { StepperItemDetail } from "./StepperItemDetail";
import type { StepperItemStatus } from "./StepperContext";
import { Button } from "../Button/Button";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  // Every story builds its own steps — these args only satisfy the required
  // props at the meta level.
  args: { accessibilityLabel: "Progress", children: [] as never },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    indicator: { control: "inline-radio", options: ["icon", "number"] },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A wrapper you can drag to resize — the Stepper responds to its own width
 * (container query), so this shows the narrow layout without resizing the
 * whole browser. */
function Resizable({ children, width }: { children: React.ReactNode; width: number }) {
  return (
    <div style={{ width, maxWidth: "100%", minWidth: 200, resize: "horizontal", overflow: "auto", padding: 4 }}>
      {children}
    </div>
  );
}

/** Order tracking, as on the order-details screen: completed steps get a
 * filled check, and a completed step can carry its own sub-events. The line
 * into a step fills once that step is reached. */
export const OrderTracking: Story = {
  render: () => (
    <Resizable width={480}>
      <Stepper accessibilityLabel="Order status">
        <StepperItem status="completed" title="Order Confirmed" timestamp="Apr 13, 2025">
          <StepperItemDetail title="Your Order has been placed." timestamp="Apr 13, 2025  02:30PM" />
          <StepperItemDetail title="Your Item has been packed successfully." timestamp="Apr 14, 2025  02:30PM" />
        </StepperItem>
        <StepperItem status="completed" title="Shipped" timestamp="Apr 15, 2025" />
        <StepperItem status="upcoming" title="Out for Delivery" />
        <StepperItem status="upcoming" title="Delivered" />
      </Stepper>
    </Resizable>
  ),
};

/** Checkout progress: horizontal, numbered. A completed step shows an
 * outlined check, the current one is filled, upcoming ones are muted. Drag
 * the corner narrower — markers shrink and labels wrap below 480px. */
export const CheckoutProgress: Story = {
  render: () => (
    <Resizable width={640}>
      <Stepper accessibilityLabel="Checkout progress" orientation="horizontal">
        <StepperItem status="completed" title="Cart" />
        <StepperItem status="current" title="Payment Mode" />
        <StepperItem status="upcoming" title="Order Placed" />
      </Stepper>
    </Resizable>
  ),
};

/** `orientation={{ base: "vertical", md: "horizontal" }}`: a timeline below
 * 600px, a progress bar from 600px — measured on the Stepper's own width,
 * so drag the corner across 600px to watch it switch. Sub-events show only
 * while vertical. */
export const ResponsiveOrientation: Story = {
  render: () => (
    <Resizable width={720}>
      <Stepper accessibilityLabel="Order status" orientation={{ base: "vertical", md: "horizontal" }}>
        <StepperItem status="completed" title="Order Confirmed" timestamp="Apr 13, 2025">
          <StepperItemDetail title="Your Order has been placed." timestamp="Apr 13, 2025  02:30PM" />
        </StepperItem>
        <StepperItem status="completed" title="Shipped" timestamp="Apr 15, 2025" />
        <StepperItem status="current" title="Out for Delivery" />
        <StepperItem status="upcoming" title="Delivered" />
      </Stepper>
    </Resizable>
  ),
};

/** A `current` step in the icon indicator shows a ringed dot. */
export const VerticalWithCurrent: Story = {
  render: () => (
    <Resizable width={480}>
      <Stepper accessibilityLabel="Order status">
        <StepperItem status="completed" title="Order Confirmed" timestamp="Apr 13, 2025" />
        <StepperItem status="current" title="Shipped" timestamp="Apr 15, 2025">
          <StepperItemDetail title="Arrived at the Pune sorting hub." timestamp="Apr 15, 2025  09:10AM" />
        </StepperItem>
        <StepperItem status="upcoming" title="Out for Delivery" />
        <StepperItem status="upcoming" title="Delivered" />
      </Stepper>
    </Resizable>
  ),
};

/** `color` on a step colors its marker and the line leading into it — e.g. a
 * cancelled order. */
export const Cancelled: Story = {
  render: () => (
    <Resizable width={480}>
      <Stepper accessibilityLabel="Order status">
        <StepperItem status="completed" title="Order Confirmed" timestamp="Apr 13, 2025" />
        <StepperItem status="completed" color="danger" title="Cancelled" timestamp="Apr 14, 2025">
          <StepperItemDetail title="Cancelled at your request. Refund initiated." timestamp="Apr 14, 2025  11:05AM" />
        </StepperItem>
      </Stepper>
    </Resizable>
  ),
};

/** Vertical with numbers instead of dots. */
export const VerticalNumbered: Story = {
  render: () => (
    <Resizable width={480}>
      <Stepper accessibilityLabel="Setup steps" indicator="number">
        <StepperItem status="completed" title="Create account" />
        <StepperItem status="current" title="Add delivery address" />
        <StepperItem status="upcoming" title="Choose a payment method" />
      </Stepper>
    </Resizable>
  ),
};

/** Many steps with long labels in a narrow container — labels wrap rather
 * than overflow. */
export const HorizontalNarrow: Story = {
  render: () => (
    <Resizable width={320}>
      <Stepper accessibilityLabel="Order status" orientation="horizontal">
        <StepperItem status="completed" title="Order Confirmed" timestamp="Apr 13" />
        <StepperItem status="completed" title="Shipped" timestamp="Apr 15" />
        <StepperItem status="current" title="Out for Delivery" />
        <StepperItem status="upcoming" title="Delivered" />
      </Stepper>
    </Resizable>
  ),
};

const CHECKOUT_STEPS = ["Cart", "Payment Mode", "Order Placed"];

/** Driving the statuses from app state. */
export const Interactive: Story = {
  render: () => {
    function Example() {
      const [active, setActive] = useState(0);
      const statusOf = (index: number): StepperItemStatus =>
        index < active ? "completed" : index === active ? "current" : "upcoming";
      return (
        <Stack gap="6">
          <Stepper accessibilityLabel="Checkout progress" orientation="horizontal">
            {CHECKOUT_STEPS.map((title, index) => (
              <StepperItem key={title} status={statusOf(index)} title={title} />
            ))}
          </Stepper>
          <Inline gap="2">
            <Button variant="secondary" isDisabled={active === 0} onClick={() => setActive((i) => i - 1)}>
              Back
            </Button>
            <Button isDisabled={active === CHECKOUT_STEPS.length} onClick={() => setActive((i) => i + 1)}>
              Next
            </Button>
          </Inline>
        </Stack>
      );
    }
    return (
      <div style={{ maxWidth: 640 }}>
        <Example />
      </div>
    );
  },
};
