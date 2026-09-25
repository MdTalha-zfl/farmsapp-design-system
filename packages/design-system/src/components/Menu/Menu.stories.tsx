import { forwardRef, useState, type ButtonHTMLAttributes } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircleIcon, ChevronDownIcon, EyeIcon, SearchIcon } from "@farmsapp/icons";
import { Menu } from "./Menu";
import { MenuOverlay } from "./MenuOverlay";
import { MenuItem } from "./MenuItem";
import { MenuDivider } from "./MenuDivider";
import { MenuFooter, MenuHeader } from "./MenuHeaderFooter";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Inline } from "../Inline/Inline";
import { Modal } from "../Modal/Modal";
import { ModalBody } from "../Modal/ModalBody";
import { ModalHeader } from "../Modal/ModalHeader";
import { Stack } from "../Stack/Stack";
import { Text } from "../Text/Text";

const meta = {
  title: "Components/Menu",
  component: Menu,
  tags: ["autodocs"],
  // Every story builds its own trigger and overlay — these args only satisfy
  // the required `children` at the meta level.
  args: { children: null },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A menu of actions from a button. The first child is the trigger, the
 * MenuOverlay is the panel. Click opens it. Keyboard: Enter,
 * Space or ArrowDown on the trigger opens it and focuses the first item; Up/
 * Down move, typing a letter jumps to the next item starting with it, Enter or
 * Space choose, Escape closes and returns focus to the trigger, Tab closes.
 * Choosing any item closes the menu. Disabled items are skipped. */
export const Basic: Story = {
  render: () => (
    <Menu>
      <Button variant="secondary" icon={ChevronDownIcon} iconPosition="right">
        Actions
      </Button>
      <MenuOverlay>
        <MenuItem title="View details" leading={<EyeIcon size="medium" />} />
        <MenuItem title="Duplicate" trailing={<Text as="span" variant="caption" color="secondary">Ctrl+D</Text>} />
        <MenuItem title="Archive" description="Hide it from the list, keep the data" />
        <MenuItem title="Unavailable" isDisabled />
        <MenuItem
          title="Notifications"
          titleSuffix={<Badge color="danger" size="small">3</Badge>}
        />
        <MenuDivider />
        <MenuItem title="Delete" color="negative" leading={<AlertCircleIcon size="medium" />} />
      </MenuOverlay>
    </Menu>
  ),
};

/** Any element that forwards a ref and passes its props to a DOM element is a
 * trigger. An IconButton, and a custom component (which must forward its ref
 * and spread the props it receives onto its button). */
const CustomTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function CustomTrigger(
  props,
  ref,
) {
  return (
    <button ref={ref} type="button" {...props} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid currentColor" }}>
      A custom trigger
    </button>
  );
});

export const DifferentTriggers: Story = {
  render: () => (
    <Inline gap="4" alignItems="center">
      <Menu>
        <IconButton icon={SearchIcon} accessibilityLabel="Search options" emphasis="moderate" />
        <MenuOverlay>
          <MenuItem title="Search everywhere" />
          <MenuItem title="Search this list" />
        </MenuOverlay>
      </Menu>
      <Menu>
        <CustomTrigger />
        <MenuOverlay>
          <MenuItem title="One" />
          <MenuItem title="Two" />
        </MenuOverlay>
      </Menu>
    </Inline>
  ),
};

/** `defaultPlacement` picks the preferred side. The panel still flips to the
 * other side and shifts along the edge to stay in view: narrow the window or
 * scroll a trigger near the bottom. */
export const Placement: Story = {
  render: () => (
    <Inline gap="4" wrap>
      {(["bottom-start", "bottom-end", "top-start", "right-start"] as const).map((placement) => (
        <Menu key={placement} defaultPlacement={placement}>
          <Button variant="tertiary">{placement}</Button>
          <MenuOverlay>
            <MenuItem title="One" />
            <MenuItem title="Two" />
            <MenuItem title="Three" />
          </MenuOverlay>
        </Menu>
      ))}
    </Inline>
  ),
};

/** `openInteraction="hover"` also opens on hover; the panel stays open while the
 * pointer moves toward it. Click still works. */
export const HoverOpen: Story = {
  render: () => (
    <Menu openInteraction="hover">
      <Button variant="secondary">Hover me</Button>
      <MenuOverlay>
        <MenuItem title="First" />
        <MenuItem title="Second" />
      </MenuOverlay>
    </Menu>
  ),
};

/** With an `href` an item is a real link (`<a>`), so middle-click and "open in a
 * new tab" work; `target` is applied (Blade's MenuItem accepts it but drops
 * it). A disabled link has no destination. For a router, pass its link component
 * as `as`; props MenuItem does not use itself, such as `to`, go through to it. */
export const Links: Story = {
  render: () => (
    <Menu>
      <Button variant="secondary">Links</Button>
      <MenuOverlay>
        <MenuItem title="Same tab" href="#same-tab" />
        <MenuItem title="New tab" href="https://example.com" target="_blank" />
        <MenuItem title="Disabled link" href="#nope" isDisabled />
        <MenuItem title="A button" onClick={() => undefined} />
      </MenuOverlay>
    </Menu>
  ),
};

/** The overlay takes any content. MenuHeader and MenuFooter rule off the ends,
 * MenuDivider separates groups, and anything else (here a paragraph and a
 * button) sits between. Arrow keys move between MenuItems only; reach the
 * button with Tab. */
export const HeaderFooterAndCustomContent: Story = {
  render: () => (
    <Menu>
      <Button variant="secondary">Profile</Button>
      <MenuOverlay minWidth="280px">
        <MenuHeader title="Asha Verma" subtitle="Admin" />
        <div style={{ padding: "8px 12px" }}>
          <Text variant="body" weight="semibold">
            Farms Cooperative Ltd
          </Text>
          <Text variant="caption" color="secondary">
            ID: FC-104233
          </Text>
        </div>
        <Button variant="tertiary" size="small">
          Switch account
        </Button>
        <MenuDivider />
        <MenuItem title="Settings" />
        <MenuItem title="Support" description="Tickets and chat" />
        <MenuItem title="Log out" color="negative" />
        <MenuFooter>
          <Text variant="caption" color="secondary">
            Refer a farm and earn on every referral
          </Text>
        </MenuFooter>
      </MenuOverlay>
    </Menu>
  ),
};

/** Nest a Menu inside a MenuOverlay with a MenuItem as its trigger. It opens on
 * hover (the pointer can travel diagonally to it) or ArrowRight; ArrowLeft or
 * Escape close it and return to its trigger; opening one closes its siblings;
 * choosing an item closes every level. Escape closes one level at a time. */
export const Submenus: Story = {
  render: () => (
    <Menu>
      <Button variant="secondary">Share</Button>
      <MenuOverlay>
        <MenuItem title="Copy link" />
        <Menu>
          <MenuItem title="Send to" />
          <MenuOverlay>
            <MenuItem title="Email" />
            <Menu>
              <MenuItem title="Messaging" />
              <MenuOverlay>
                <MenuItem title="WhatsApp" />
                <MenuItem title="SMS" />
              </MenuOverlay>
            </Menu>
            <MenuItem title="Print" />
          </MenuOverlay>
        </Menu>
        <Menu>
          <MenuItem title="Export" />
          <MenuOverlay>
            <MenuItem title="PDF" />
            <MenuItem title="Spreadsheet" />
          </MenuOverlay>
        </Menu>
      </MenuOverlay>
    </Menu>
  ),
};

/** Controlled with `isOpen`, and `onOpenChange` which receives `{ isOpen }`. */
export const Controlled: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <Stack gap="2">
          <Text variant="body">{`Open: ${isOpen}`}</Text>
          <Button size="small" variant="tertiary" onClick={() => setIsOpen(true)}>
            Open externally
          </Button>
          <Menu isOpen={isOpen} onOpenChange={({ isOpen: next }) => setIsOpen(next)}>
            <Button variant="secondary">Controlled</Button>
            <MenuOverlay>
              <MenuItem title="One" />
              <MenuItem title="Two" />
            </MenuOverlay>
          </Menu>
        </Stack>
      );
    }
    return <Example />;
  },
};

/** 40 items: the panel is capped to the space available and scrolls (Blade's
 * overlay does not scroll unless you add your own wrapper); keyboard navigation
 * scrolls the focused item into view. */
export const LongMenu: Story = {
  render: () => (
    <Menu>
      <Button variant="secondary">Long menu</Button>
      <MenuOverlay>
        {Array.from({ length: 40 }, (_, i) => (
          <MenuItem key={i} title={`Action ${i + 1}`} />
        ))}
      </MenuOverlay>
    </Menu>
  ),
};

/** A menu inside a Modal renders above it, and Escape closes only the menu: the
 * first press must not also close the Modal. */
export const InsideModal: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open modal</Button>
          <Modal isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Menu in a modal">
            <ModalHeader title="Menu in a modal" />
            <ModalBody>
              <Menu>
                <Button variant="secondary">Menu in a modal</Button>
                <MenuOverlay>
                  <MenuItem title="First" />
                  <MenuItem title="Second" />
                </MenuOverlay>
              </Menu>
            </ModalBody>
          </Modal>
        </>
      );
    }
    return <Example />;
  },
};
