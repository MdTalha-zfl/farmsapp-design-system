import type { Meta, StoryObj } from "@storybook/react-vite";
import { Countdown } from "./Countdown";
import { Stack } from "../Stack/Stack";

const meta = {
  title: "Components/Countdown",
  component: Countdown,
  tags: ["autodocs"],
} satisfies Meta<typeof Countdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const inOneDayThirtyHours = () => new Date(Date.now() + 1000 * 60 * 60 * 26 + 1000 * 60 * 60 * 2);

/** A sale-ends timer, the common e-commerce placement. */
export const Default: Story = {
  args: { targetDate: inOneDayThirtyHours() },
};

export const Sizes: Story = {
  args: { targetDate: inOneDayThirtyHours() },
  render: (args) => (
    <Stack gap="4">
      {(["small", "medium", "large", "xlarge", "2xlarge"] as const).map((size) => (
        <Stack key={size} gap="1">
          <span style={{ fontSize: 12, color: "#666" }}>{size}</span>
          <Countdown {...args} size={size} />
        </Stack>
      ))}
    </Stack>
  ),
};

/** A short-lived offer (e.g. a flash deal under an hour) can drop the
 * "Days"/"Hours" boxes it will never need. */
export const MinutesAndSecondsOnly: Story = {
  args: { targetDate: new Date(Date.now() + 1000 * 60 * 5), units: ["minutes", "seconds"] },
};

export const AlreadyExpired: Story = {
  args: { targetDate: new Date(Date.now() - 1000) },
};

/** A banner/hero-strip placement: a full-width colored section with the
 * timer centered inside it, e.g. above a category page or at the top of a
 * sale landing page. */
export const FullWidthSection: Story = {
  args: { targetDate: inOneDayThirtyHours() },
  render: (args) => (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "24px 16px",
        backgroundColor: "var(--ds-color-surface-subtle, #f5f5f5)",
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 20 }}>Sale ends in</span>
      <Countdown {...args} size="2xlarge" />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
};

/** Same full-width banner, forced into a phone-width viewport — proves the
 * boxes shrink via `clamp()` and wrap onto a second row instead of
 * overflowing or forcing horizontal scroll. */
export const FullWidthSectionMobile: Story = {
  args: { targetDate: inOneDayThirtyHours() },
  render: (args) => (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "24px 16px",
        backgroundColor: "var(--ds-color-surface-subtle, #f5f5f5)",
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 20 }}>Sale ends in</span>
      <Countdown {...args} size="2xlarge" />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile1" },
  },
};

export const CustomLabels: Story = {
  args: {
    targetDate: inOneDayThirtyHours(),
    labels: { days: "din", hours: "ghante", minutes: "minute", seconds: "second" },
  },
};
