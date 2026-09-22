import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircleIcon } from "@farmsapp/icons";
import { BottomSheet } from "./BottomSheet";
import { BottomSheetHeader } from "./BottomSheetHeader";
import { BottomSheetBody } from "./BottomSheetBody";
import { BottomSheetFooter } from "./BottomSheetFooter";
import { Button } from "../Button/Button";
import { Badge } from "../Badge/Badge";
import { Text } from "../Text/Text";
import { Stack } from "../Stack/Stack";
import { Inline } from "../Inline/Inline";
import { SearchInput } from "../Input/SearchInput/SearchInput";

const meta = {
  title: "Components/BottomSheet",
  component: BottomSheet,
  tags: ["autodocs"],
  // Every story drives its own isOpen/children via a local render function
  // (BottomSheet has no uncontrolled mode) — these args only satisfy the
  // required props at the meta level.
  args: {
    isOpen: false,
    children: null,
  },
} satisfies Meta<typeof BottomSheet>;

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

/** The common case. Drag the grabber, the header or the footer to resize it
 * between snap points; flick it down (or drag well below the lowest point)
 * to dismiss. The body scrolls natively and is deliberately *not* a drag
 * zone. With the grabber focused, ArrowUp/ArrowDown step between snap points
 * and Home/End jump to the ends. */
export const WithHeaderBodyFooter: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open bottom sheet</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)} snapPoints={[0.3, 0.6, 0.95]}>
            <BottomSheetHeader title="Terms & conditions" subtitle="Read carefully before accepting" />
            <BottomSheetBody>
              <Paragraphs count={1} />
            </BottomSheetBody>
            <BottomSheetFooter>
              <Inline gap={"4"}>
                <Button isFullWidth variant="tertiary" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button isFullWidth onClick={() => setIsOpen(false)}>
                  I agree
                </Button>
              </Inline>
            </BottomSheetFooter>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** `snapPoints` are ascending fractions of the viewport height. Here the
 * sheet opens at the middle point (0.6) and can be dragged to 0.3 or 0.95. */
export const CustomSnapPoints: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open [0.3, 0.6, 0.95]</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)} snapPoints={[0.3, 0.6, 0.95]}>
            <BottomSheetHeader title="Custom snap points" />
            <BottomSheetBody>
              <Paragraphs count={20} />
            </BottomSheetBody>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** One snap point: the sheet has a single resting height, so the grabber has
 * nothing to step between and drops out of the tab order (it can still be
 * dragged, to dismiss). */
export const SingleSnapPoint: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open [0.6]</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)} snapPoints={[0.6]}>
            <BottomSheetHeader title="Single snap point" />
            <BottomSheetBody>
              <Paragraphs count={20} />
            </BottomSheetBody>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** Content-fit: the panel is only as tall as its content, so a short sheet is
 * *shorter than its snap points* instead of leaving empty space. Every snap
 * point exceeds the content here, so they collapse into one stop. */
export const ShortContent: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open short sheet</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
            <BottomSheetHeader title="Quick action" />
            <BottomSheetBody>
              <Text variant="body">Just a sentence — the sheet hugs it.</Text>
            </BottomSheetBody>
            <BottomSheetFooter>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                Got it
              </Button>
            </BottomSheetFooter>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** Very long body: capped at the top snap point (0.85 of the viewport by
 * default); the body scrolls while the header and footer stay fixed. */
export const ScrollableBody: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open long sheet</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
            <BottomSheetHeader title="Very long content" />
            <BottomSheetBody>
              <Paragraphs count={60} />
            </BottomSheetBody>
            <BottomSheetFooter>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                Done
              </Button>
            </BottomSheetFooter>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** No BottomSheetHeader (or an empty one): a floating close button is shown
 * instead, and the grabber alone is the drag handle. */
export const Headerless: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open headerless</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Promotion">
            <BottomSheetBody>
              <Stack gap="2">
                <Text variant="body" weight="semibold" size="large">
                  Self-explanatory content
                </Text>
                <Text variant="body" color="secondary">
                  With no header there is no title, so `accessibilityLabel` names the dialog for screen readers.
                </Text>
              </Stack>
            </BottomSheetBody>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** Every header slot: back button, leading icon, title + subtitle, trailing
 * badge. Back is a plain callback — this story just closes the sheet. */
export const HeaderVariants: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open full header</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
            <BottomSheetHeader
              title="Address details"
              subtitle="Saved addresses speed up checkout"
              leading={<AlertCircleIcon color="warning" />}
              trailing={<Badge color="warning">Action needed</Badge>}
              showBackButton
              onBackButtonClick={() => setIsOpen(false)}
            />
            <BottomSheetBody>
              <Paragraphs count={6} />
            </BottomSheetBody>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** Extra header content (`children`), e.g. a search field. Drags never start
 * from the input itself — typing and selecting text keep working — but they
 * do start from the header's non-interactive areas. */
export const HeaderWithSearch: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open with search</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)} snapPoints={[0.5, 0.9]}>
            <BottomSheetHeader title="Search users">
              <SearchInput id="sheet-search" accessibilityLabel="Search users" placeholder="Type a name" />
            </BottomSheetHeader>
            <BottomSheetBody>
              <Paragraphs count={15} />
            </BottomSheetBody>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** `isDismissible={false}` — no close button, no backdrop-click, no Escape,
 * and swiping down can't dismiss it (dragging below the lowest point
 * rubber-bands back). Only the in-sheet action closes it. */
export const NotDismissible: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open non-dismissible</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)} isDismissible={false}>
            <BottomSheetHeader title="Accept to continue" />
            <BottomSheetBody>
              <Text variant="body">
                Try Escape, clicking the backdrop, or dragging down past the lowest point — none of them close this.
              </Text>
            </BottomSheetBody>
            <BottomSheetFooter>
              <Button isFullWidth onClick={() => setIsOpen(false)}>
                I accept
              </Button>
            </BottomSheetFooter>
          </BottomSheet>
        </>
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
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)} initialFocusRef={confirmRef}>
            <BottomSheetHeader title="Focus test" />
            <BottomSheetBody>
              <Text variant="body">Focus should start on &quot;Confirm&quot;, not the close button.</Text>
            </BottomSheetBody>
            <BottomSheetFooter>
              <Button ref={confirmRef} isFullWidth onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </BottomSheetFooter>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** `padding="0"` on BottomSheetBody — for content that bleeds to the edges. */
export const ZeroPaddingBody: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open zero-padding</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
            <BottomSheetHeader title="Edge-to-edge" />
            <BottomSheetBody padding="0">
              <Stack gap="0">
                {Array.from({ length: 8 }, (_, i) => (
                  <Text key={i} variant="body" padding="4" backgroundColor={i % 2 ? "raised" : "sunken"}>
                    Row {i + 1}
                  </Text>
                ))}
              </Stack>
            </BottomSheetBody>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** Bad `snapPoints` (out of order, out of range) are cleaned up — sorted and
 * clamped to 0–1 — with a dev-mode console warning, never a throw. Open the
 * browser console after opening this. */
export const InvalidSnapPoints: Story = {
  render: () => {
    function Example() {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open [0.9, 0.3, 2]</Button>
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)} snapPoints={[0.9, 0.3, 2]}>
            <BottomSheetHeader title="Cleaned-up snap points" />
            <BottomSheetBody>
              <Paragraphs count={20} />
            </BottomSheetBody>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};

/** Nested sheets — a second sheet opened from the first, in the same shape as
 * Modal's stacked story and with the same known v1 limitations: no z-index
 * stack registry (the second stacks above the first by DOM mount order, both
 * sharing one z-index token). With the two sheets rendered as siblings (as
 * here), the focus trap moves focus into the top sheet, so Escape closes only
 * that one; a second Escape closes the first (verified in a real browser).
 * Not verified: a sheet rendered *inside* another sheet's JSX children, where
 * React's synthetic-event bubbling through the React tree could reach both
 * handlers. */
export const NestedSheets: Story = {
  render: () => {
    function Example() {
      const [outerOpen, setOuterOpen] = useState(false);
      const [innerOpen, setInnerOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOuterOpen(true)}>Open first sheet</Button>
          <BottomSheet isOpen={outerOpen} onDismiss={() => setOuterOpen(false)}>
            <BottomSheetHeader title="First sheet" />
            <BottomSheetBody>
              <Paragraphs count={4} />
            </BottomSheetBody>
            <BottomSheetFooter>
              <Button isFullWidth onClick={() => setInnerOpen(true)}>
                Open nested sheet
              </Button>
            </BottomSheetFooter>
          </BottomSheet>
          <BottomSheet isOpen={innerOpen} onDismiss={() => setInnerOpen(false)} snapPoints={[0.4, 0.6]}>
            <BottomSheetHeader title="Second sheet" showBackButton onBackButtonClick={() => setInnerOpen(false)} />
            <BottomSheetBody>
              <Paragraphs count={3} />
            </BottomSheetBody>
          </BottomSheet>
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
          <BottomSheet isOpen={isOpen} onDismiss={() => setIsOpen(false)} accessibilityLabel="Controlled sheet">
            <BottomSheetHeader title="Controlled sheet" />
            <BottomSheetBody>
              <Text variant="body">isOpen is driven entirely by the buttons on the page.</Text>
            </BottomSheetBody>
          </BottomSheet>
        </>
      );
    }
    return <Example />;
  },
};
