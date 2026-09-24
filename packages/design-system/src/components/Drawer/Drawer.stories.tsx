import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircleIcon } from "@farmsapp/icons";
import { Drawer } from "./Drawer";
import { DrawerHeader } from "./DrawerHeader";
import { DrawerBody } from "./DrawerBody";
import { DrawerFooter } from "./DrawerFooter";
import { Modal } from "../Modal/Modal";
import { ModalHeader } from "../Modal/ModalHeader";
import { ModalBody } from "../Modal/ModalBody";
import { ModalFooter } from "../Modal/ModalFooter";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Inline } from "../Inline/Inline";
import { SearchInput } from "../Input/SearchInput/SearchInput";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";
import { TextInput } from "../Input/TextInput/TextInput";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  // Every story drives its own isOpen/children via a local render function
  // (Drawer has no uncontrolled mode) — these args only satisfy the required
  // props at the meta level.
  args: {
    isOpen: false,
    onDismiss: () => {},
    children: null,
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function Paragraphs({ count }: { count: number }) {
  return (
    <Stack gap="2">
      {Array.from({ length: count }, (_, i) => (
        <Text key={i} variant="body">
          Paragraph {i + 1} — the body is the only region that scrolls; the header and footer stay pinned.
        </Text>
      ))}
    </Stack>
  );
}

/** The common case: a right-edge, full-height panel with a pinned header and
 * footer and a scrolling body. Escape, the overlay and the close button all
 * dismiss it. */
export const WithHeaderBodyFooter: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open drawer</Button>
          <Drawer isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
            <DrawerHeader title="Order details" subtitle="Review before you confirm" />
            <DrawerBody>
              <Paragraphs count={8} />
            </DrawerBody>
            <DrawerFooter>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
              <Button isFullWidth variant="tertiary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </DrawerFooter>
          </Drawer>
        </>
      );
    }
    return <Example />;
  },
};

/** Every header slot: leading icon, title, subtitle, a badge beside the title,
 * a trailing element, and extra content (a search field) below the row. */
export const HeaderVariants: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open full header</Button>
          <Drawer isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
            <DrawerHeader
              title="Address book"
              subtitle="Saved delivery addresses"
              leading={<AlertCircleIcon color="warning" />}
              titleSuffix={<Badge color="warning">3 new</Badge>}
            >
              <SearchInput id="drawer-search" accessibilityLabel="Search addresses" placeholder="Search" />
            </DrawerHeader>
            <DrawerBody>
              <Paragraphs count={12} />
            </DrawerBody>
          </Drawer>
        </>
      );
    }
    return <Example />;
  },
};

/** No DrawerHeader: a floating close button is shown instead (Blade renders
 * none, leaving a headerless drawer with no close control), and the body
 * starts below it so nothing runs underneath. `accessibilityLabel` names the
 * dialog for screen readers, since there is no title. */
export const Headerless: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open headerless</Button>
          <Drawer isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Promotion">
            <DrawerBody>
              <Stack gap="2">
                <Text variant="body" weight="semibold" size="large">
                  Self-explanatory content
                </Text>
                <Text variant="body" color="secondary">
                  Check the top-right corner: the close button doesn&apos;t overlap the text.
                </Text>
              </Stack>
            </DrawerBody>
          </Drawer>
        </>
      );
    }
    return <Example />;
  },
};

/** Long body: it scrolls independently while the header and footer stay
 * pinned. */
export const ScrollableBody: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open long drawer</Button>
          <Drawer isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
            <DrawerHeader title="Terms and conditions" />
            <DrawerBody>
              <Paragraphs count={60} />
            </DrawerBody>
            <DrawerFooter>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                I agree
              </Button>
            </DrawerFooter>
          </Drawer>
        </>
      );
    }
    return <Example />;
  },
};

/** `isDismissible={false}` — no close button, no overlay-click, no Escape.
 * Only the in-drawer action closes it. */
export const NotDismissible: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open non-dismissible</Button>
          <Drawer isOpen={isOpen} onDismiss={() => setIsOpen(false)} isDismissible={false}>
            <DrawerHeader title="Accept to continue" />
            <DrawerBody>
              <Text variant="body">Try Escape or clicking the dimmed area — neither closes this.</Text>
            </DrawerBody>
            <DrawerFooter>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                I accept
              </Button>
            </DrawerFooter>
          </Drawer>
        </>
      );
    }
    return <Example />;
  },
};

/** `showOverlay={false}`: no backdrop, so nothing is dimmed, clicks reach the
 * page behind, and (as in Blade) the page scroll is not locked either. Focus
 * is still trapped inside the drawer. */
export const NoOverlay: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      const [clicks, setClicks] = useState(0);
      return (
        <Stack gap="2">
          <Inline gap="2">
            <Button onClick={() => setIsOpen(true)}>Open without overlay</Button>
            <Button variant="tertiary" onClick={() => setClicks((count) => count + 1)}>
              {`Page button (clicked ${clicks}×)`}
            </Button>
          </Inline>
          <Drawer isOpen={isOpen} onDismiss={() => setIsOpen(false)} showOverlay={false}>
            <DrawerHeader title="No backdrop" />
            <DrawerBody>
              <Text variant="body">The page behind stays undimmed and clickable.</Text>
            </DrawerBody>
          </Drawer>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** `initialFocusRef` — focus lands on a specific control on open instead of
 * the default close button. */
export const InitialFocusRef: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      const confirmRef = useRef<HTMLButtonElement>(null);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open (focus lands on Confirm)</Button>
          <Drawer isOpen={isOpen} onDismiss={() => setIsOpen(false)} initialFocusRef={confirmRef}>
            <DrawerHeader title="Focus test" />
            <DrawerBody>
              <Text variant="body">Focus should start on &quot;Confirm&quot;, not the close button.</Text>
            </DrawerBody>
            <DrawerFooter>
              <Button ref={confirmRef} isFullWidth onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </DrawerFooter>
          </Drawer>
        </>
      );
    }
    return <Example />;
  },
};

/** `isLazy`. Type something in each drawer, close it, and reopen it. The lazy
 * one (default) unmounts after closing, so its text is gone. With
 * `isLazy={false}` the whole tree stays mounted while hidden, so the text is
 * still there — what SideNav relies on to keep a portal target alive. */
export const LazyVersusNotLazy: Story = {
  render: () => {
    function Example() {
      const [lazyOpen, setLazyOpen] = useState(false);
      const [keptOpen, setKeptOpen] = useState(false);
      return (
        <>
          <Inline gap="2">
            <Button variant="secondary" onClick={() => setLazyOpen(true)}>
              Open lazy (default)
            </Button>
            <Button variant="secondary" onClick={() => setKeptOpen(true)}>
              Open isLazy=false
            </Button>
          </Inline>
          <Drawer isOpen={lazyOpen} onDismiss={() => setLazyOpen(false)}>
            <DrawerHeader title="Lazy" />
            <DrawerBody>
              <TextInput id="lazy-notes" label="Notes" placeholder="Type, close, reopen" />
            </DrawerBody>
          </Drawer>
          <Drawer isOpen={keptOpen} onDismiss={() => setKeptOpen(false)} isLazy={false}>
            <DrawerHeader title="Not lazy" />
            <DrawerBody>
              <TextInput id="kept-notes" label="Notes" placeholder="Type, close, reopen" />
            </DrawerBody>
          </Drawer>
        </>
      );
    }
    return <Example />;
  },
};

/** A Modal opened from inside a Drawer stacks above it. The Drawer's z-index
 * token (275) sits below Modal's (300) — Blade puts its Drawer above Modal,
 * which only works there because Blade's Modal has a `zIndex` prop. */
export const ModalOpenedFromDrawer: Story = {
  render: () => {
    function Example() {
      const [drawerOpen, setDrawerOpen] = useState(false);
      const [confirmOpen, setConfirmOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <Drawer isOpen={drawerOpen} onDismiss={() => setConfirmOpen(true)}>
            <DrawerHeader title="Edit profile" />
            <DrawerBody>
              <Text variant="body">Close this drawer (Escape, overlay, or ×) to be asked to confirm.</Text>
            </DrawerBody>
          </Drawer>
          <Modal isOpen={confirmOpen} onDismiss={() => setConfirmOpen(false)} accessibilityLabel="Discard changes">
            <ModalHeader title="Discard changes?" />
            <ModalBody>
              <Text variant="body">You have unsaved changes.</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="tertiary" onClick={() => setConfirmOpen(false)}>
                Keep editing
              </Button>
              <Button
                variant="negative"
                onClick={() => {
                  setConfirmOpen(false);
                  setDrawerOpen(false);
                }}
              >
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

/** Fully controlled from outside — there is no uncontrolled mode. */
export const Controlled: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Inline gap="2">
            <Button size="small" variant="tertiary" onClick={() => setIsOpen(true)}>
              Open externally
            </Button>
            <Button size="small" variant="tertiary" onClick={() => setIsOpen(false)}>
              Close externally
            </Button>
          </Inline>
          <Drawer isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Controlled drawer">
            <DrawerHeader title="Controlled drawer" />
            <DrawerBody>
              <Text variant="body">isOpen is driven entirely by the buttons on the page.</Text>
            </DrawerBody>
          </Drawer>
        </>
      );
    }
    return <Example />;
  },
};
