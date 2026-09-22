import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircleIcon } from "@farmsapp/icons";
import { Modal } from "./Modal";
import { ModalHeader } from "./ModalHeader";
import { ModalBody } from "./ModalBody";
import { ModalFooter } from "./ModalFooter";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Box } from "../Box/Box";
import { Inline } from "../Inline/Inline";
import { Stack } from "../Stack/Stack";

const meta = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  // Every story below drives its own isOpen/children via a local render
  // function (Modal has no uncontrolled mode) — these args exist only to
  // satisfy Modal's required props at the meta level.
  args: {
    isOpen: false,
    children: null,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Template 1 — standard modal with header, full-width equal footer
 * buttons. The common case: forms, detail views, guided flows. */
export const WithHeader: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open modal</Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Header title">
            <ModalHeader title="Header title" subtitle="Header subtitle" />
            <ModalBody>
              <Text variant="body">Body content goes here.</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" isFullWidth onClick={() => setIsOpen(false)}>
                Secondary
              </Button>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                Primary
              </Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** Template 2 — destructive confirmation. No ModalHeader (external floating
 * close button instead), a negative-variant primary action, right-aligned
 * compact footer buttons. */
export const DestructiveConfirmation: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setIsOpen(true)}>
            Delete item
          </Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Discard import">
            <ModalBody>
              <Stack gap="2">
                <Box backgroundColor="sunken" borderRadius="md" padding="2" display="inline-flex">
                  <AlertCircleIcon color="danger" size="large" />
                </Box>
                <Text variant="body" weight="semibold" size="large">
                  Discard import?
                </Text>
                <Text variant="body" color="secondary">
                  We do not save the progress, you&apos;ll need to upload the files again.
                </Text>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button variant="tertiary" onClick={() => setIsOpen(false)}>
                No, go back
              </Button>
              <Button variant="negative" onClick={() => setIsOpen(false)}>
                Discard
              </Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** Template 3 — headerless, full-width footer buttons. For self-explanatory
 * content (embedded form/media) where a header label is redundant. */
export const HeaderlessFullWidth: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setIsOpen(true)}>
            Open headerless (full-width)
          </Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Headerless modal">
            <ModalBody>
              <Text variant="body">Self-explanatory content — no title needed.</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" isFullWidth onClick={() => setIsOpen(false)}>
                Secondary
              </Button>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                Primary
              </Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** Template 4 — headerless, compact right-aligned buttons. */
export const HeaderlessCompact: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button variant="secondary" onClick={() => setIsOpen(true)}>
            Open headerless (compact)
          </Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Compact headerless modal">
            <ModalBody>
              <Text variant="body">Compact confirmation content.</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="tertiary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>Confirm</Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** `size` — small (default, 400px) / medium (760px) / large (1024px) /
 * full (100vw/100vh). */
export const Sizes: Story = {
  render: () => {
    function Example() {
      const [openSize, setOpenSize] = useState<"small" | "medium" | "large" | "full" | null>(null);
      return (
        <>
          <Inline gap="2">
            {(["small", "medium", "large", "full"] as const).map((size) => (
              <Button key={size} variant="secondary" onClick={() => setOpenSize(size)}>
                {size}
              </Button>
            ))}
          </Inline>
          <Modal isOpen={openSize !== null} onDismiss={() => setOpenSize(null)} size={openSize ?? "small"} accessibilityLabel="Sized modal">
            <ModalHeader title={`size="${openSize}"`} />
            <ModalBody>
              <Text variant="body">Resize the story viewport to see how this size behaves at different widths.</Text>
            </ModalBody>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** `isDismissible={false}` — no close button (header or floating), no
 * backdrop-click dismiss, no Escape dismiss. Only the in-body action
 * buttons can close it — for flows that require an explicit choice. */
export const NotDismissible: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open non-dismissible modal</Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} isDismissible={false} accessibilityLabel="Required action">
            <ModalHeader title="Accept terms to continue" />
            <ModalBody>
              <Text variant="body">
                Try clicking the backdrop or pressing Escape — neither closes this. No close button is rendered
                either. Only the button below works.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                I accept
              </Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** `initialFocusRef` — focus lands on a specific element on open instead of
 * the default close button. Tab from there to confirm the trap still
 * cycles correctly. */
export const InitialFocusRef: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      const primaryButtonRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open (focus lands on Save)</Button>
          <Modal
            isOpen={isOpen}
            onDismiss={() => setIsOpen(false)}
            initialFocusRef={primaryButtonRef}
            accessibilityLabel="Focus test"
          >
            <ModalHeader title="Focus test" />
            <ModalBody>
              <Text variant="body">Focus should land on &quot;Save&quot; below, not the close button.</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button ref={primaryButtonRef} onClick={() => setIsOpen(false)}>
                Save
              </Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** Long body content — `ModalBody` scrolls independently while header/
 * footer stay fixed, confirming the panel doesn't grow past `maxHeight`. */
export const ScrollableBody: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open scrollable modal</Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Long content">
            <ModalHeader title="Terms and conditions" />
            <ModalBody>
              <Stack gap="2">
                {Array.from({ length: 30 }, (_, i) => (
                  <Text key={i} variant="body">
                    Paragraph {i + 1} — this body scrolls independently while the header and footer stay fixed in
                    place.
                  </Text>
                ))}
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                I agree
              </Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** `padding="0"` on ModalBody — for content that wants to bleed to the
 * panel's edges (e.g. an embedded image/table). */
export const ZeroPaddingBody: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open zero-padding modal</Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Zero padding body">
            <ModalHeader title="Edge-to-edge content" />
            <ModalBody padding="0">
              <Box backgroundColor="sunken" padding="8">
                <Text variant="body">This content bleeds to the panel edges (padding=&quot;0&quot;).</Text>
              </Box>
            </ModalBody>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** Stacked/nested modals — a second Modal opened from within the first's
 * footer. Matches Blade's own real v1 limitation, documented in
 * decisions/decision-modal-api-and-structure.md: no automatic z-index
 * incrementing (both use the same `--ds-z-index-modal` token; the nested
 * one stacks visually above the first purely because it mounts later in
 * DOM order, same as Blade's own default-tier behavior), and no "only
 * close the topmost modal" arbitration — each Modal's own Escape handler
 * is independent. With the two modals rendered as siblings (as here), the
 * focus trap moves focus into the top modal, so Escape closes only that
 * one; a second Escape closes the first (verified in a real browser). Not
 * verified: a modal rendered *inside* another modal's JSX children, where
 * React's synthetic-event bubbling through the React tree could reach both
 * handlers. */
export const StackedModals: Story = {
  render: () => {
    function Example() {
      const [outerOpen, setOuterOpen] = useState(false);
      const [innerOpen, setInnerOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOuterOpen(true)}>Open first modal</Button>
          <Modal isOpen={outerOpen} onDismiss={() => setOuterOpen(false)} accessibilityLabel="First modal">
            <ModalHeader title="First modal" />
            <ModalBody>
              <Text variant="body">
                This is the first modal. Open a second one on top of it, then press Escape: only the top one
                closes.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="secondary" onClick={() => setOuterOpen(false)}>
                Close
              </Button>
              <Button onClick={() => setInnerOpen(true)}>Open nested modal</Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={innerOpen} onDismiss={() => setInnerOpen(false)} size="small" accessibilityLabel="Second modal">
            <ModalHeader title="Second modal" />
            <ModalBody>
              <Text variant="body">
                Stacked above the first purely by DOM mount order — both share the same z-index tier, there&apos;s no
                incrementing stack counter.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button isFullWidth onClick={() => setInnerOpen(false)}>
                Close this one
              </Button>
            </ModalFooter>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};

/** Real controlled open/close via external buttons, matching the pattern
 * already used by Tooltip/Popover — Modal has no uncontrolled mode at all
 * (always fully controlled via `isOpen`), unlike those two. */
export const Controlled: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <Stack gap="2">
          <Inline gap="2">
            <Button size="small" variant="tertiary" onClick={() => setIsOpen(true)}>
              Open externally
            </Button>
            <Button size="small" variant="tertiary" onClick={() => setIsOpen(false)}>
              Close externally
            </Button>
          </Inline>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Controlled modal">
            <ModalHeader title="Controlled modal" />
            <ModalBody>
              <Text variant="body">isOpen is driven entirely by the buttons above.</Text>
            </ModalBody>
          </Modal>
        </Stack>
      );
    }
    return <Example />;
  },
};
