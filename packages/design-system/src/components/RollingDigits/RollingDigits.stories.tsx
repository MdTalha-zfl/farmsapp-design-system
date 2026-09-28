import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RollingDigits } from "./RollingDigits";
import { Stack } from "../Stack/Stack";
import { Inline } from "../Inline/Inline";
import { IconButton } from "../IconButton/IconButton";
import { PlusIcon, MinusIcon } from "@farmsapp/icons";

const meta = {
  title: "Components/RollingDigits",
  component: RollingDigits,
  tags: ["autodocs"],
} satisfies Meta<typeof RollingDigits>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 42, fontSize: "32px" },
};

/** Non-digit characters (currency symbol, thousands separator, decimal
 * point) render as static text alongside the rolling digits, unanimated. */
export const FormattedPrice: Story = {
  args: { value: "₹1,234.56", fontSize: "28px" },
};

/** The common ecommerce case this was pulled out of Countdown/CartQuantityStepper
 * for: a price that rolls to its new value once a coupon is applied. */
export const PriceAfterCoupon: Story = {
  args: { value: 1499 },
  render: () => {
    const [price, setPrice] = useState(1499);
    return (
      <Stack gap="3">
        <RollingDigits value={`₹${price.toLocaleString("en-IN")}`} fontSize="32px" color="primary" />
        <button type="button" onClick={() => setPrice((p) => (p === 1499 ? 1199 : 1499))}>
          {price === 1499 ? "Apply SAVE300 coupon" : "Remove coupon"}
        </button>
      </Stack>
    );
  },
};

/** A live-ticking counter, the same mechanism Countdown uses internally. */
export const LiveTicker: Story = {
  args: { value: 0 },
  render: () => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setValue((v) => (v + 1) % 100), 1000);
      return () => clearInterval(id);
    }, []);
    return <RollingDigits value={String(value).padStart(2, "0")} fontSize="40px" />;
  },
};

/** A manual quantity stepper — the same shape CartQuantityStepper now uses for its
 * value. */
export const QuantityStepper: Story = {
  args: { value: 1 },
  render: () => {
    const [qty, setQty] = useState(1);
    return (
      <Inline gap="2" alignItems="center">
        <IconButton icon={MinusIcon} accessibilityLabel="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} />
        <RollingDigits value={qty} fontSize="20px" />
        <IconButton icon={PlusIcon} accessibilityLabel="Increase" onClick={() => setQty((q) => q + 1)} />
      </Inline>
    );
  },
};
