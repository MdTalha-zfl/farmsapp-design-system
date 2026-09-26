import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster, type ToasterPlacement } from "./Toaster";
import { toast } from "./toast";
import type { ToastIntent } from "./toastStore";
import { Button } from "../Button/Button";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";

// No `autodocs` tag on purpose: the docs page renders every story at once,
// and each story mounts its own <Toaster>, so every toast would appear
// several times over. Toasts are global state, so the docs page can't
// isolate them the way it does for props-driven components.
const meta = {
  title: "Components/Toast",
  component: Toaster,
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

const INTENTS: ToastIntent[] = ["neutral", "info", "success", "warning", "danger"];

/** One button per intent. Auto-dismisses after 6s; hovering, focusing or
 * hiding the tab pauses the countdown. */
export const Intents: Story = {
  render: () => (
    <>
      <Toaster />
      <Inline gap="2">
        {INTENTS.map((intent) => (
          <Button
            key={intent}
            variant="secondary"
            onClick={() => toast.show({ intent, description: `Toast intent: ${intent}` })}
          >
            {intent}
          </Button>
        ))}
      </Inline>
    </>
  ),
};

/** A toast with an action never auto-dismisses by default: a timer must not
 * remove the button while someone is tabbing to it. */
export const WithAction: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        variant="secondary"
        onClick={() =>
          toast.show({
            intent: "success",
            title: "Item archived",
            description: "It will be deleted in 30 days.",
            action: { label: "Undo", onPress: () => toast.show({ description: "Restored." }) },
            onDismiss: ({ reason }) => toast.show({ intent: "info", description: `Dismissed by: ${reason}` }),
          })
        }
      >
        Archive item
      </Button>
    </>
  ),
};

/** Devanagari and long unbroken strings must wrap, never clip: there is no
 * fixed height, no line clamp and no JS measurement. */
export const LongAndDevanagariText: Story = {
  render: () => (
    <>
      <Toaster />
      <Inline gap="2">
        <Button
          variant="secondary"
          onClick={() =>
            toast.show({
              intent: "warning",
              title: "भुगतान लंबित है",
              description:
                "आपके खाते में पर्याप्त शेष राशि नहीं है। कृपया कुछ राशि जोड़ें और फिर से प्रयास करें, या किसी अन्य भुगतान विधि का उपयोग करें।",
              duration: 10000,
            })
          }
        >
          Devanagari
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.show({
              intent: "danger",
              description:
                "Request failed: https://api.example.com/v1/orders/1234567890abcdefghijklmnopqrstuvwxyz/items/9876543210/details",
              duration: 10000,
            })
          }
        >
          Long URL
        </Button>
      </Inline>
    </>
  ),
};

/** Reusing an id updates the same toast in place (the only dedupe). */
export const UpdateInPlace: Story = {
  render: () => (
    <>
      <Toaster />
      <Button
        variant="secondary"
        onClick={() => {
          const id = toast.show({ intent: "info", description: "Uploading…", duration: Infinity });
          setTimeout(() => toast.update(id, { intent: "success", description: "Upload complete.", duration: 4000 }), 1500);
        }}
      >
        Start upload
      </Button>
    </>
  ),
};

/** At most 3 are on screen; the rest wait in a queue and appear as slots
 * free up. */
export const QueueOverflow: Story = {
  render: () => (
    <>
      <Toaster />
      <Inline gap="2">
        <Button
          variant="secondary"
          onClick={() => {
            for (let i = 1; i <= 6; i += 1) toast.show({ description: `Toast ${i} of 6`, duration: 3000 });
          }}
        >
          Fire 6
        </Button>
        <Button variant="tertiary" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </Inline>
    </>
  ),
};

const PLACEMENTS: ToasterPlacement[] = [
  "top-start",
  "top-center",
  "top-end",
  "bottom-start",
  "bottom-center",
  "bottom-end",
];

export const Placement: Story = {
  args: { placement: "top-end" },
  argTypes: { placement: { control: "select", options: PLACEMENTS } },
  render: (args) => (
    <Stack gap="2">
      <Toaster {...args} />
      <Text size="small">
        Pick a placement in Controls. With none set it is bottom-center on phones and bottom-start
        from 600px up.
      </Text>
      <Button variant="secondary" onClick={() => toast.show({ description: `Placed ${args.placement}` })}>
        Show toast
      </Button>
    </Stack>
  ),
};
